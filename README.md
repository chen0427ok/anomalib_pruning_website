

# 🎯 Anomalib 剪枝後端服務

這是一個基於 FastAPI 開發的後端服務，支援 Anomalib 模型剪枝的可視化系統。

## 📁 專案結構

```
fastapi_backend/
├── routers/         # API 路由處理
├── models/          # 資料模型與結構定義
├── services/        # 業務邏輯服務
├── static/          # 靜態資源
├── data/            # 資料檔案
├── main.py          # 應用入口
├── requirements.txt # 專案依賴項
└── fix_deps.sh      # 依賴修復腳本
```

## 🧰 環境需求

- Python 3.8+
- FastAPI
- 其他依賴請參考 `requirements.txt`

## 🚀 快速開始

1. 建立虛擬環境：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
.\venv\Scripts\activate  # Windows
```

2. 安裝依賴：
```bash
pip install -r requirements.txt
```

3. 設定環境變數：
```bash
# 建立 .env 檔案並新增必要的環境變數
cp .env.example .env
# 編輯 .env 加入你的設定
```

4. 啟動服務：
```bash
uvicorn main:app --reload
```

## 📄 API 文件

啟動服務後，可以透過以下網址檢視 API 文件：

- Swagger UI: http://localhost:8000/docs  
- ReDoc: http://localhost:8000/redoc

## 🔧 主要功能

- 模型剪枝方法管理  
- 剪枝參數配置  
- 剪枝結果分析  
- 與前端互動的 WebSocket 支援  

## 🛠️ 開發指南

1. 新增路由：
   - 在 `routers/` 目錄新增路由檔案
   - 到 `main.py` 註冊該路由

2. 新增資料模型：
   - 在 `models/` 中定義
   - 使用 Pydantic 進行資料驗證

3. 新增服務邏輯：
   - 在 `services/` 目錄新增服務類別
   - 遵循單一職責原則撰寫

## 🤝 貢獻方式

1. Fork 專案  
2. 建立功能分支  
3. 提交修改  
4. Push 到分支  
5. 建立 Pull Request  

## 📜 授權

本專案採用 [MIT License](LICENSE)

---

# 🖥️ Anomalib 剪枝可視化前端

這是一個使用 React 和 Tailwind CSS 開發的前端應用，用於可視化展示 Anomalib 模型剪枝的過程與結果。

## 🔧 技術棧

- React  
- Tailwind CSS  
- Craco  
- Node.js  

## 📁 專案結構

```
pruning-visualization/
├── src/               # 原始碼目錄
├── public/            # 公共資源
├── node_modules/      # 依賴模組
├── package.json       # 專案設定
├── tailwind.config.js # Tailwind 設定
└── craco.config.js    # Craco 設定
```

## 🧰 開發環境需求

- Node.js 14.0+  
- npm 6.0+ 或 yarn 1.22+

## 🚀 快速開始

1. 安裝依賴：
```bash
npm install
# 或
yarn install
```

2. 啟動開發伺服器：
```bash
npm start
# 或
yarn start
```

3. 建立生產版本：
```bash
npm run build
# 或
yarn build
```

## 🎯 主要功能

- 剪枝方法可視化呈現  
- 即時剪枝進度監控  
- 剪枝前後結果對比分析  
- 模型效能指標展示  
- 參數調整互動式體驗  

## 🛠️ 開發指南

1. 元件開發：
   - 遵循 React 的元件開發最佳實踐
   - 使用 Tailwind CSS 編寫樣式
   - 保持元件可重用性

2. 狀態管理：
   - 使用 React Hooks 管理元件狀態
   - 合理運用 Context API
   - 遵循狀態提升原則

3. 樣式開發：
   - 遵循 Tailwind CSS 的設計理念
   - 維持樣式一致性
   - 注重響應式設計

## ⚙️ 專案設定

### Tailwind CSS

本專案使用 Tailwind CSS 管理樣式，設定檔為 `tailwind.config.js`：

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // 自定義主題設定
    },
  },
  plugins: [],
};
```

### Craco

本專案使用 Craco 進行 Webpack 設定覆蓋，設定檔為 `craco.config.js`。

## 🤝 貢獻方式

1. Fork 專案  
2. 建立功能分支  
3. 提交修改  
4. Push 到分支  
5. 建立 Pull Request  

## 📜 授權

本專案採用 [MIT License](LICENSE)

---
