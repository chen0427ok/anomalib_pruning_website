import os
import json
from typing import List, Dict, Optional
import hashlib
import traceback

# 尝试导入OpenAI
try:
    from openai import OpenAI
    has_openai = True
except ImportError:
    has_openai = False

# 尝试导入Google Generative AI
try:
    import google.generativeai as genai
    has_gemini = True
except ImportError:
    has_gemini = False

# 尝试导入PDF处理相关的库
try:
    import fitz  # PyMuPDF
    import chromadb
    from chromadb.utils import embedding_functions
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    has_pdf_tools = True
except ImportError:
    has_pdf_tools = False

class PDFProcessor:
    def __init__(self, pdf_dir="./pdf_documents"):
        self.pdf_dir = pdf_dir
        
        # 确保PDF目录存在
        if not os.path.exists(self.pdf_dir):
            os.makedirs(self.pdf_dir)
            
        # 初始化文本分割器
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        # 使用sentence-transformers作为嵌入模型
        self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        
        # 初始化ChromaDB客户端
        self.client = chromadb.Client()
        
        # 存储每个文件对应的集合
        self.collections = {}
        
        # 缓存文件
        self.cache_file = os.path.join(self.pdf_dir, "processed_files_cache.json")
        self.processed_files = self._load_cache()
        
    def _load_cache(self):
        """加载已处理文件的缓存"""
        try:
            if os.path.exists(self.cache_file) and os.path.getsize(self.cache_file) > 0:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            print(f"警告: 缓存文件读取失败 ({str(e)})")
            
        # 确保缓存目录存在
        cache_dir = os.path.dirname(self.cache_file)
        if cache_dir and not os.path.exists(cache_dir):
            os.makedirs(cache_dir)
            
        # 创建新的缓存文件
        with open(self.cache_file, 'w', encoding='utf-8') as f:
            json.dump({}, f)
        return {}
    
    def _save_cache(self):
        """保存已处理文件的缓存"""
        try:
            # 确保缓存目录存在
            cache_dir = os.path.dirname(self.cache_file)
            if cache_dir and not os.path.exists(cache_dir):
                os.makedirs(cache_dir)
            # 保存缓存
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.processed_files, f, ensure_ascii=False, indent=4)
        except Exception as e:
            print(f"警告: 缓存文件保存失败 ({str(e)})")
    
    def _calculate_file_hash(self, file_path):
        """计算文件的MD5哈希值"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def _extract_pdf_metadata(self, doc):
        """提取PDF的元数据（标题、作者等）"""
        metadata = doc.metadata
        title = metadata.get('title', '')
        authors = metadata.get('author', '')
        
        # 从第一页提取文本
        if doc.page_count > 0:
            first_page = doc[0]
            text = first_page.get_text()
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            
            # 如果元数据中没有标题和作者，尝试从文本中提取
            if not title and lines:
                title = lines[0]
                
            # 尝试从前几行识别作者
            if not authors:
                for line in lines[1:5]:
                    if ',' in line and not any(keyword in line.lower() for keyword in 
                    ['abstract', 'introduction', 'university', 'department']):
                        authors = line
                        break
        
        return {
            'title': title.strip(),
            'authors': authors.strip()
        }
    
    def process_pdf(self, pdf_path):
        """处理单个PDF文件，提取文本和元数据"""
        try:
            doc = fitz.open(pdf_path)
            text_chunks = []
            metadatas = []
            ids = []
            chunk_id = 0
            
            # 提取PDF元数据
            pdf_metadata = self._extract_pdf_metadata(doc)
            
            for page_num in range(doc.page_count):
                page = doc.load_page(page_num)
                text = page.get_text()
                chunks = self.text_splitter.split_text(text)
                
                for chunk in chunks:
                    text_chunks.append(chunk)
                    metadatas.append({
                        "page": page_num + 1,
                        "source": os.path.basename(pdf_path),
                        "title": pdf_metadata['title'],
                        "authors": pdf_metadata['authors']
                    })
                    ids.append(f"chunk_{chunk_id}")
                    chunk_id += 1
            
            doc.close()
            return text_chunks, metadatas, ids
        except Exception as e:
            print(f"处理PDF文件 {pdf_path} 时出错: {str(e)}")
            return [], [], []
    
    def _get_collection_name(self, filename):
        """根据文件名生成集合名称"""
        # 移除.pdf后缀，替换特殊字符
        return filename.replace('.pdf', '').replace(' ', '_').lower()
    
    def process_all_pdfs(self):
        """处理所有PDF文件，为每个文件创建向量存储集合"""
        all_chunks_data = {}
        any_new_files = False
        
        for filename in os.listdir(self.pdf_dir):
            if filename.endswith('.pdf'):
                try:
                    collection_name = self._get_collection_name(filename)
                    print(f"处理文件: {filename}")
                    
                    # 获取或创建该文件的集合
                    try:
                        collection = self.client.get_collection(
                            name=collection_name,
                            embedding_function=self.embedding_function
                        )
                    except:
                        collection = self.client.create_collection(
                            name=collection_name,
                            embedding_function=self.embedding_function
                        )
                    
                    self.collections[filename] = collection
                    
                    # 检查文件是否已处理
                    pdf_path = os.path.join(self.pdf_dir, filename)
                    current_hash = self._calculate_file_hash(pdf_path)
                    
                    # 检查集合中是否已有数据
                    collection_count = collection.count()
                    
                    # 如果集合为空或文件已更改，处理文件
                    if collection_count == 0 or self.processed_files.get(filename) != current_hash:
                        print(f"处理文件: {filename}")
                        chunks, metadatas, ids = self.process_pdf(pdf_path)
                        
                        if chunks:
                            collection.add(
                                documents=chunks,
                                metadatas=metadatas,
                                ids=ids
                            )
                            
                            all_chunks_data[filename] = {
                                "chunks": chunks,
                                "metadatas": metadatas,
                                "ids": ids
                            }
                            
                            self.processed_files[filename] = current_hash
                            any_new_files = True
                except Exception as e:
                    print(f"处理文件 {filename} 时发生错误: {str(e)}")
                    traceback.print_exc()
        
        # 保存缓存
        if any_new_files:
            self._save_cache()
    
    def query(self, question, n_results=3, specific_file=None):
        """从文档中检索相关内容"""
        if specific_file:
            # 从指定文件的集合中查询
            collection_name = self._get_collection_name(specific_file)
            try:
                collection = self.client.get_collection(
                    name=collection_name,
                    embedding_function=self.embedding_function
                )
                
                collection_count = collection.count()
                if collection_count == 0:
                    return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
                
                results = collection.query(
                    query_texts=[question],
                    n_results=min(n_results, collection_count)
                )
                return results
            except Exception as e:
                print(f"查询集合 {collection_name} 时出错: {str(e)}")
                return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
        else:
            # 合并所有集合的结果
            all_results = []
            
            for filename, collection in self.collections.items():
                try:
                    collection_count = collection.count()
                    if collection_count == 0:
                        continue
                    
                    results = collection.query(
                        query_texts=[question],
                        n_results=min(n_results, collection_count)
                    )
                    
                    if results["documents"][0]:
                        all_results.extend(zip(
                            results["documents"][0],
                            results["metadatas"][0],
                            results["distances"][0]
                        ))
                except Exception as e:
                    print(f"查询文件 {filename} 时出错: {str(e)}")
            
            if not all_results:
                return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
            
            # 按相似度排序并取前n_results个结果
            all_results.sort(key=lambda x: x[2])  # 按距离排序
            top_results = all_results[:n_results]
            
            # 重新组织结果格式
            return {
                "documents": [[r[0] for r in top_results]],
                "metadatas": [[r[1] for r in top_results]],
                "distances": [[r[2] for r in top_results]]
            }

    def query_and_generate(self, question, n_results=5, specific_file=None):
        """检索相关文档并准备答案生成所需信息"""
        # 先进行检索
        results = self.query(question, n_results, specific_file)
        
        # 如果没有检索到文档，返回空结果
        if not results["documents"][0]:
            return {
                "answer_info": {
                    "prompt": f"请回答以下问题，但说明没有找到相关文档：{question}",
                    "question": question,
                    "context": ""
                },
                "documents": [],
                "metadatas": [],
                "distances": []
            }
        
        # 构建上下文
        context_with_citations = []
        for i, (doc, meta) in enumerate(zip(results["documents"][0], results["metadatas"][0])):
            # 添加文件信息和引用
            source_info = f"[{i+1}] 文件: {meta.get('source', '')}, 页码: {meta.get('page', '')}"
            title_info = f"标题: {meta.get('title', '')}"
            author_info = f"作者: {meta.get('authors', '')}"
            
            context_with_citations.append(f"{source_info}\n{title_info}\n{author_info}\n\n{doc}\n")
        
        retrieved_context = "\n".join(context_with_citations)
        
        # 生成答案提示信息
        prompt = f"""
        你是一个专业的学术助手。请根据提供的上下文回答问题。
        
        上下文：
        {retrieved_context}
        
        问题：{question}
        
        回答要求：
        1. 只使用上下文中的信息回答问题
        2. 如果上下文中没有足够信息，请明确说明
        3. 提供具体的引用来源
        4. 保持学术性的回答风格
        """
        
        # 返回完整结果
        return {
            "answer_info": {
                "prompt": prompt,
                "question": question,
                "context": retrieved_context
            },
            "documents": results["documents"][0],
            "metadatas": results["metadatas"][0],
            "distances": results["distances"][0] if "distances" in results else []
        }

class RAGService:
    def __init__(self, model_provider="openai"):
        """
        初始化RAG服务
        :param model_provider: 选择使用的模型提供者 ("openai" 或 "gemini")
        """
        if not has_pdf_tools:
            raise ImportError("缺少必要的PDF处理库。请安装PyMuPDF、ChromaDB、LangChain等相关依赖。")
        
        self.pdf_processor = PDFProcessor()
        self.model_provider = model_provider.lower()
        self.conversation_history = []  # 存储对话历史
        
        self._setup_model()
    
    def _setup_model(self):
        """设置AI模型"""
        if self.model_provider == "openai":
            if not has_openai:
                raise ImportError("未安装OpenAI库。请使用pip install openai进行安装。")
            self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        elif self.model_provider == "gemini":
            if not has_gemini:
                raise ImportError("未安装Google Generative AI库。请使用pip install google-generativeai进行安装。")
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            generation_config = {
                "temperature": 0.7,
                "top_p": 1,
                "top_k": 1,
                "max_output_tokens": 2048,
            }
            self.model = genai.GenerativeModel(
                model_name="gemini-1.5-pro-latest",
                generation_config=generation_config
            )
        else:
            raise ValueError("不支持的模型提供者。请选择'openai'或'gemini'")
    
    def initialize(self):
        """处理所有PDF文件并建立索引"""
        self.pdf_processor.process_all_pdfs()
    
    def _get_specific_file(self, question: str) -> Optional[str]:
        """根据问题内容选择特定文件"""
        question = question.lower()
        
        # 文件匹配规则
        file_patterns = {
            "PRUNING FILTERS FOR EFFICIENT CONVNETS.pdf": [
                "pruning filters", "efficient convnets", "li", "kadav"
            ],
            "NEURAL PRUNING VIA GROWING REGULARIZATION.pdf": [
                "growing regularization", "greg", "neural pruning"
            ],
            "NIPS-1989-optimal-brain-damage-Paper.pdf": [
                "optimal brain", "brain damage", "obd", "optimal brain damage"
            ]
            # 可以添加更多文件模式
        }
        
        # 检查每个文件的关键字
        for file_name, keywords in file_patterns.items():
            if any(keyword in question for keyword in keywords):
                return file_name
        
        return None
    
    def _get_answer_from_model(self, prompt, context, question):
        """根据不同的模型提供者获取答案"""
        try:
            if self.model_provider == "openai":
                response = self.client.chat.completions.create(
                    model="gpt-3.5-turbo",  # 或使用 "gpt-4" 等
                    messages=[
                        {"role": "system", "content": "你是一个专业的学术论文助手。请根据提供的论文内容回答问题。"},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1000
                )
                return response.choices[0].message.content
            else:  # gemini
                response = self.model.generate_content(prompt)
                return response.text
        except Exception as e:
            print(f"生成答案时出错: {str(e)}")
            return f"无法生成答案。请尝试重新提问或使用其他方式查询。错误: {str(e)}"
    
    def get_answer(self, question: str) -> dict:
        """获取问题的答案"""
        try:
            # 根据问题内容选择特定文件
            specific_file = self._get_specific_file(question)
            
            # 使用RAG进行检索并生成答案信息
            rag_results = self.pdf_processor.query_and_generate(
                question=question,
                n_results=5,
                specific_file=specific_file
            )
            
            # 使用LLM生成最终答案
            answer = self._get_answer_from_model(
                prompt=rag_results["answer_info"]["prompt"],
                context=rag_results["answer_info"]["context"],
                question=question
            )
            
            # 更新对话历史
            self.conversation_history.extend([
                {"role": "user", "content": question},
                {"role": "assistant", "content": answer}
            ])
            
            # 返回结果
            return {
                "Question": question,
                "Answer": answer,
                "rag_chunks": rag_results["documents"],
                "references": [{
                    "title": meta["title"],
                    "authors": meta["authors"],
                    "source": meta["source"],
                    "page": meta["page"]
                } for meta in rag_results["metadatas"]],
                "used_rag": True,
                "selected_file": specific_file,
                "conversation_history": self.conversation_history
            }
        except Exception as e:
            print(f"获取答案时出错: {str(e)}")
            traceback.print_exc()
            return {
                "Question": question,
                "Answer": f"处理您的问题时出错: {str(e)}",
                "rag_chunks": [],
                "references": [],
                "used_rag": False,
                "conversation_history": self.conversation_history
            }
    
    def clear_history(self):
        """清除对话历史"""
        self.conversation_history = [] 