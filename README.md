# Text-to-SQL & Code Generation API Service

這是一個使用 TypeScript、Express、LangChain 和 Google Gemini 2.5 Flash 模型構建的綜合後端服務。它不僅支援 Text-to-SQL，還整合了 Model Context Protocol (MCP) 來輔助 AI Agent 進行高效的程式碼生成與資料庫管理。

## 🌟 功能特色

- **雙資料庫支援**: 同時支援 **MySQL** (TypeORM/Sequelize) 與 **MongoDB** (Mongoose)。
- **MCP Server 整合**: 提供一系列工具給 Cursor 或 Antigravity Agent 使用：
  - `list-collections`: 查詢資料庫表單/Collections。
  - `get-sequelize-prompt`: 生成 MySQL Sequelize Model 與 Controller 的指令。
  - `get-mongoose-prompt`: 生成 MongoDB Mongoose Model 與 Controller 的指令。
  - `get-antd-prompt`: 生成 React/Ant Design 5.0 前端頁面的指令 (含知識庫)。
- **智能 CLI Agent**: 內建互動式 CLI Agent (`npm run chat`)，可直接在終端機中與 AI 對話並執行資料庫操作。
- **安全性設計**:
  - 資料庫查詢使用參數化查詢防止 SQL Injection。
  - LLM 初始化採用 Lazy Loading，無 Key 也能啟動 Server (僅生成功能受限)。

---

## 🚀 快速開始

### 1. 安裝與設定

```bash
# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env
```

編輯 `.env` 檔案：
```env
PORT=3000
GOOGLE_API_KEY=你的_GEMINI_API_KEY
DB_TYPE=mongo  # 'mysql' 或 'mongo'
DB_HOST=localhost
...
```

### 2. 資料庫設定
本專案支援自動切換資料庫模式。請在 `.env` 中設定 `DB_TYPE`：
- `DB_TYPE=mysql`: 使用 TypeORM 連接 MySQL。
- `DB_TYPE=mongo`: 使用 Mongoose 連接 MongoDB。

### 3. 使用 MCP Server (AI 輔助開發)

此專案本身即是一個 MCP Server。請在您的 AI 編輯器 (如 Cursor) 的 MCP 設定檔中加入：

```json
{
  "mcpServers": {
    "testllm-server": {
      "command": "node",
      "args": ["/path/to/testllm/src/mcp-server.ts"] 
      // 或使用 npx tsx /path/to/testllm/src/mcp-server.ts
    }
  }
}
```

**可用 MCP 工具**:
| 工具名稱 | 用途 |
| :--- | :--- |
| `list-collections` | 列出目前資料庫中的所有表格或 Collections。 |
| `get-sequelize-prompt` | 獲取生成 Sequelize 程式碼的完整 Prompt (含 Schema)。 |
| `get-mongoose-prompt` | 獲取生成 Mongoose 程式碼的完整 Prompt。 |
| `get-antd-prompt` | 獲取生成 Ant Design 前端程式碼的 Prompt (含 AntD 知識庫)。 |

> **提示**: 在 `.cursorrules` 中已設定 AI 應優先使用這些 MCP 工具。

---

## 🛠️ 開發與執行

### 啟動 HTTP Server (開發模式)
```bash
npm run dev
# Server 運行於 http://localhost:3000
```

### 啟動 CLI Agent (互動對話)
```bash
npm run chat
# 進入互動模式，可直接下指令查詢資料庫或生成程式碼
```

### 測試 MCP Server
```bash
npm run mcp:test
# 檢查 MCP Server 是否能正常啟動及連線資料庫
```

---

## 📂 專案結構

- `src/mcp-server.ts`: MCP Server 入口與工具註冊。
- `src/llm.ts`: Google Gemini LLM 實例 (Lazy Init)。
- `src/db.ts`: 資料庫連線管理 (支援 MySQL/Mongo 切換)。
- `src/sequelize.ts`: MySQL 相關生成邏輯。
- `src/mongoose.ts`: MongoDB 相關生成邏輯。
- `src/antd.ts`: Ant Design 前端生成邏輯。
- `src/antd.ts`: Ant Design 前端生成邏輯。
- `src/generated/`: 生成的程式碼存放位置 (含 Models, Controllers, Routes)。
- `src/controllers/`: 手寫 Controller 存放位置。
- `src/models/`: 手寫 Model 存放位置。
- `tmp/`: 暫存檔存放位置。

## 技術棧

- **Runtime**: Node.js, TypeScript
- **Web Framework**: Express
- **AI/LLM**: LangChain, Google Gemini
- **Database**: TypeORM (MySQL), Mongoose (MongoDB)
- **Protocol**: Model Context Protocol (MCP)
