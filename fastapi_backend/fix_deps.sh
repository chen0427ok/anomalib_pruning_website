#!/bin/bash
# 修复依赖问题的脚本

# 卸载所有相关包以避免冲突
pip uninstall -y openai langchain-openai huggingface_hub sentence_transformers chromadb langchain-core langchain

# 安装旧版本 OpenAI
pip install openai==0.28.0

# 然后修改 chat.py 文件以使用旧版 OpenAI API 