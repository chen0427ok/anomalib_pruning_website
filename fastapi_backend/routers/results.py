from fastapi import APIRouter, HTTPException, Query
import json
from pathlib import Path

router = APIRouter()

@router.get("/results")
async def get_results(
    prune_type: str = Query(..., description="剪枝方式"),
    ratio: float = Query(..., description="剪枝比例"),
    dataset: str = Query("bottle", description="數據集")
):
    """
    根据剪枝方法和比例获取实验结果
    
    参数:
    - prune_type: 剪枝方法 (字符串)
    - ratio: 剪枝比例 (浮点数)
    - dataset: 數據集 (字符串)
    
    返回JSON格式的实验结果
    """
    try:
        # 加载数据
        data_path = Path("data/results.json")
        if not data_path.exists():
            raise HTTPException(
                status_code=500,
                detail=f"数据文件不存在: {str(data_path)}"
            )
            
        with open(data_path, "r") as f:
            data = json.load(f)
        
        # 构建键名
        key = f"{prune_type}_{ratio}"
        
        # 检查键是否存在
        if key not in data:
            return {"error": f"未找到匹配的結果: {key}"}
        
        # 获取对应的结果数据
        result = data[key]
        
        # 添加图片路径
        base_url = "http://localhost:8000"
        
        # 使用三个参数构建示例图片路径：dataset、prune_type和ratio
        example_images = [
            f"{base_url}/static/examples/{dataset}/{prune_type}_{ratio}_{i}.png" 
            for i in range(1, 6)
        ]
        
        # 打印生成的图片路径用于调试
        print(f"生成的图片路径: {example_images}")
        
        # 构建响应
        response = {
            "metrics": result["metrics"],
            "example_images": example_images
        }
        
        return response
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"错误详情: {error_details}")
        
        raise HTTPException(
            status_code=500,
            detail=f"获取结果时出错: {str(e)}"
        ) 