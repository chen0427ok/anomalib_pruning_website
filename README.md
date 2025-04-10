# Anomalib 剪枝后端服务

这是一个基于 FastAPI 开发的后端服务，用于支持 Anomalib 模型剪枝可视化系统。

## 项目结构

```
fastapi_backend/
├── routers/         # API 路由处理
├── models/          # 数据模型和架构定义
├── services/        # 业务逻辑服务
├── static/          # 静态文件
├── data/           # 数据文件
├── main.py         # 应用入口
├── requirements.txt # 项目依赖
└── fix_deps.sh     # 依赖修复脚本
```

## 环境要求

- Python 3.8+
- FastAPI
- 其他依赖见 requirements.txt

## 快速开始

1. 创建虚拟环境：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
.\venv\Scripts\activate  # Windows
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 设置环境变量：
```bash
# 创建 .env 文件并添加必要的环境变量
cp .env.example .env
# 编辑 .env 文件添加你的配置
```

4. 运行服务：
```bash
uvicorn main:app --reload
```

## API 文档

启动服务后，可以访问以下地址查看 API 文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 主要功能

- 模型剪枝方法管理
- 剪枝参数配置
- 剪枝结果分析
- 与前端交互的 WebSocket 支持

## 开发指南

1. 添加新的路由：
   - 在 `routers/` 目录下创建新的路由文件
   - 在 `main.py` 中注册路由

2. 添加新的模型：
   - 在 `models/` 目录下定义新的数据模型
   - 使用 Pydantic 进行数据验证

3. 添加新的服务：
   - 在 `services/` 目录下创建新的服务类
   - 遵循单一职责原则

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE) 
