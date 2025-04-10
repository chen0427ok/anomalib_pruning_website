import json
import os
from typing import Dict, Any

# 数据文件路径
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
RESULTS_FILE = os.path.join(DATA_DIR, "results.json")

def load_results_data() -> Dict[str, Any]:
    """
    加载JSON数据文件中的实验结果
    
    返回一个字典，键为(prune_type, ratio)对，值为对应的实验结果
    """
    try:
        # 确保目录存在
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)
            
        # 如果文件不存在，返回空字典
        if not os.path.exists(RESULTS_FILE):
            print(f"警告: 结果数据文件不存在: {RESULTS_FILE}")
            return {}
            
        # 读取JSON文件
        with open(RESULTS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except Exception as e:
        print(f"加载数据文件时出错: {e}")
        return {} 