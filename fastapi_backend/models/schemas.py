from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# 聊天请求模型
class ChatRequest(BaseModel):
    message: str = Field(..., description="用户的消息")
    prune_type: str = Field(..., description="当前选择的剪枝方法")
    ratio: float = Field(..., description="当前选择的剪枝比例")
    
    class Config:
        schema_extra = {
            "example": {
                "message": "magnitude剪枝方法的原理是什么？",
                "prune_type": "magnitude",
                "ratio": 0.5
            }
        }

# 聊天响应模型
class ChatResponse(BaseModel):
    message: str = Field(..., description="AI的回复")
    
    class Config:
        schema_extra = {
            "example": {
                "message": "Magnitude Pruning通过移除权重绝对值较小的连接来剪枝网络。这种方法基于假设权重值较小的连接对网络输出的贡献较小。"
            }
        }

# 实验结果指标模型
class Metrics(BaseModel):
    image_AUROC: float
    image_F1Score: float
    pixel_AUROC: float
    pixel_F1Score: float

# 实验结果模型
class ExperimentResult(BaseModel):
    metrics: Metrics
    structure: str
    example_images: List[str] 

    model_config = {
        "json_schema_extra": {
            "example": {
                "metrics": {
                    "image_AUROC": 0.9,
                    "image_F1Score": 0.8,
                    "pixel_AUROC": 0.95,
                    "pixel_F1Score": 0.85
                },
                "structure": "magnitude",
                "example_images": ["image1.jpg", "image2.jpg"]
            }
        },
        "protected_namespaces": ()
    } 