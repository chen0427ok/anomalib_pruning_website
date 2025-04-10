from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
import os
import json
import traceback
from dotenv import load_dotenv

# 確保加載環境變量
load_dotenv()

router = APIRouter()

# 獲取 OpenAI API 密鑰
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    print("警告：未设置 OPENAI_API_KEY 环境变量")
print(f"API Key 設置狀態: {'已設置' if openai_api_key else '未設置'}")

# 剪枝方法对应的论文文件
prune_papers = {
    'magnitude': "magnitude.json",
    'batch_norm': "batch_norm.json",
    'growing_reg': "growing_reg.json",
    'layer_adaptive': "layer_adaptive.json", 
    'group_norm': "group_norm.json"
}

# 加载指定剪枝方法的论文内容
def load_paper_content(prune_type: str):
    try:
        base_path = os.path.dirname(__file__)
        json_path = os.path.join(base_path, f"{prune_type}.json")
        
        if not os.path.exists(json_path):
            print(f"找不到论文文件: {json_path}")
            return []
            
        with open(json_path, 'r', encoding='utf-8') as f:
            paper_data = json.load(f)
            
        # 直接返回chunks部分
        filename = next(iter(paper_data.keys()))
        chunks = paper_data[filename].get("chunks", [])  # 返回前5段内容作为上下文
        
        # 打印RAG chunks用于调试
        print(f"为剪枝方法 '{prune_type}' 加载了 {len(chunks)} 个文本块")
        for i, chunk in enumerate(chunks):
            print(f"文本块 {i+1} 开头: {chunk[:100]}...")
        
        return chunks
        
    except Exception as e:
        print(f"加载论文内容时出错: {e}")
        traceback.print_exc()  # 打印详细错误栈
        return []

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    处理用户的聊天消息并返回AI回复
    
    参数:
    - message: 用户的消息 (字符串)
    - prune_type: 当前选择的剪枝方法 (字符串)
    - ratio: 当前选择的剪枝比例 (浮点数)
    
    返回JSON格式的AI回复
    """
    try:
        message = request.message
        prune_type = request.prune_type
        ratio = request.ratio
        
        print(f"收到聊天请求 - 消息: '{message[:50]}...', 剪枝方法: {prune_type}, 比例: {ratio}")
        
        # 获取剪枝方法相关的论文内容
        paper_content = load_paper_content(prune_type)
        paper_context = "\n\n".join(paper_content) if paper_content else ""
        
        # 使用 OpenAI API
        if openai_api_key:
            try:
                # 確保導入模塊在嘗試之前
                try:
                    import openai
                except ImportError:
                    print("错误: 未安装OpenAI模块。请运行 'pip install openai' 安装")
                    raise Exception("OpenAI模块未安装")
                
                # 檢查API版本
                print(f"使用OpenAI模块版本: {openai.__version__ if hasattr(openai, '__version__') else '未知'}")
                
                openai.api_key = openai_api_key
                
                # 构建提示信息
                prompt = f"""
                用户当前正在查看PatchCore模型的{prune_type}剪枝方法，剪枝比例为{ratio}。
                
                用户问题: {message}
                
                以下是关于{prune_type}剪枝方法的相关论文内容，可能对回答有帮助：
                
                {paper_context}
                
                请根据上述论文内容和你的知识，提供关于这个剪枝方法的专业、有用且友好的回答。回答请用中文。
                """
                
                print("正在调用OpenAI API...")
                
                # 根据OpenAI版本选择正确的API调用方式
                try:
                    # 尝试新版API
                    response = openai.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[
                            {"role": "system", "content": "你是一個專注於深度學習模型剪枝方法的AI助手。你会基于提供的论文片段和你的知识提供准确的回答。"},
                            {"role": "user", "content": prompt}
                        ],
                        max_tokens=500,
                        temperature=0.7
                    )
                    ai_message = response.choices[0].message.content
                except AttributeError:
                    # 尝试旧版API
                    print("尝试使用旧版OpenAI API...")
                    response = openai.ChatCompletion.create(
                        model="gpt-4o-mini",
                        messages=[
                            {"role": "system", "content": "你是一個專注於深度學習模型剪枝方法的AI助手。你会基于提供的论文片段和你的知识提供准确的回答。"},
                            {"role": "user", "content": prompt}
                        ],
                        max_tokens=500,
                        temperature=0.7
                    )
                    ai_message = response.choices[0].message.content
                
                print("OpenAI API调用成功")
                return ChatResponse(message=ai_message)
                
            except Exception as e:
                # 详细记录错误信息
                print(f"使用 OpenAI API 調用失敗: {e}")
                print("详细错误:")
                traceback.print_exc()
        else:
            print("警告: 未设置OpenAI API密钥，使用默认回答")
        
        # 使用预设回答
        prune_info = {
            'magnitude': "Magnitude Pruning通过移除权重绝对值较小的连接来剪枝网络。这种方法基于假设权重值较小的连接对网络输出的贡献较小。",
            'batch_norm': "Batch Norm Pruning通过分析和剪枝批量归一化层中的参数来减少模型大小。",
            'growing_reg': "Growing Reg是一种结合了网络增长和正则化的方法，旨在找到更优的网络结构。",
            'layer_adaptive': "Layer Adaptive Pruning根据每一层的重要性进行不同程度的剪枝，保留更重要的层。",
            'group_norm': "Group Norm Pruning针对使用组归一化的网络架构，通过分析和剪枝归一化参数来减少模型复杂度。"
        }
        
        # 构建回答
        ai_message = f"关于{prune_type}剪枝方法（剪枝比例{ratio}）：\n\n{prune_info.get(prune_type, '这是一种常见的剪枝方法。')}"
        
        if paper_content:
            ai_message += f"\n\n相关论文摘要：{paper_content[0][:200]}..."
            
        if ratio > 0.7:
            ai_message += "\n\n注意：较高的剪枝比例可能会导致模型性能显著下降。"
        
        return ChatResponse(message=ai_message)
        
    except Exception as e:
        print(f"处理聊天请求时出错: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"处理聊天请求时出错: {str(e)}"
        ) 