from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import results, chat
from dotenv import load_dotenv
import os
# 加載環境變數
load_dotenv()

# 獲取 API Key
openai_api_key = os.getenv("OPENAI_API_KEY")
print(f"主程序中的 API Key 狀態: {'已設置' if openai_api_key else '未設置'}")

# 创建FastAPI应用
app = FastAPI(
    title="PatchCore剪枝方法可视化系统API",
    description="提供剪枝方法实验结果和AI聊天功能的API",
    version="1.0.0"
)

# 配置CORS中间件，允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含API路由
app.include_router(results.router, prefix="/api", tags=["results"])
app.include_router(chat.router, prefix="/api", tags=["chat"])

# 挂载静态文件目录
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
    os.makedirs(os.path.join(static_dir, "models"))
    os.makedirs(os.path.join(static_dir, "examples"))
    os.makedirs(os.path.join(static_dir, "examples", "bottle"))
    
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# 根路径
@app.get("/")
async def root():
    return {"message": "歡迎使用PatchCore剪枝方法視覺化系統API"}

# 如果直接运行此文件
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 