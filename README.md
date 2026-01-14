# Text-to-SQL API Service

這是一個使用 TypeScript、Express、LangChain 和 Google Gemini 2.5 Flash 模型構建的 Text-to-SQL API 服務。它可以理解您的自然語言問題，自動生成對應的 SQL 查詢語法，並從資料庫中檢索資料。

## 功能特色

- **自然語言轉 SQL**: 使用 Google Gemini 先進的 AI 模型將問題轉換為精確的 SQL。
- **Ant Design 代碼生成**: 自動生成高品質的 Ant Design 5.0 React 組件代碼，並自動保存到 outputs 資料夾。
- **安全性**: 使用參數化查詢 (Parameterized Queries) 來防止 SQL Injection 攻擊。
- **結構化輸出**: 利用 Zod 定義輸出格式，確保 AI 生成的回應符合預期。
- **TypeScript**: 完整的型別定義，開發維護更安全。
- **MCP 支援**: 提供 MCP Server 讓 AI Agent 直接理解資料庫結構與生成程式碼。

## 安裝說明

1. **複製專案** (如果你還沒有的話)

2. **安裝 Node.js 套件**
   ```bash
   npm install
   ```

3. **設定環境變數**
   專案根目錄下有一個 `.env.example` 檔案，請將其複製為 `.env` 並填入您的設定：
   ```bash
   cp .env.example .env
   ```
   
   請編輯 `.env` 檔案填入以下資訊：
   - `PORT`: 伺服器運作 port (預設 3000)
   - `GOOGLE_API_KEY`: 您的 Google AI Studio API Key
   - `DB_HOST`: 資料庫位址
   - `DB_PORT`: 資料庫 Port (預設 3306)
   - `DB_USER`: 資料庫使用者名稱
   - `DB_PASS`: 資料庫密碼
   - `DB_NAME`: 資料庫名稱

## MCP Server 設定 (Antigravity / Cursor)

本專案支援 Model Context Protocol (MCP)，可以讓您的 AI 編輯器 (如 Cursor 或 Antigravity Agent) 直接與專案的資料庫和工具進行互動。

### 1. 前置準備 (Prerequisite)

確保您已經安裝了專案依賴 (包含必要的 MCP SDK)：

```bash
npm install
```

### 2. 設定檔建立與編輯

MCP 需要一份 `.vscode/mcp.json` 設定檔來告訴編輯器如何啟動 Server。我們已經準備好了一份範本：

1.  **建立設定檔**：
    本專案根目錄下已提供 `mcp_config.json.example` 範本。請將其複製並設定為您的 MCP 設定檔。
    
    *   **VS Code / Cursor**: 建議將其複製到 `.vscode/mcp.json`：
        ```bash
        mkdir -p .vscode
        cp mcp_config.json.example .vscode/mcp.json
        ```
    *   **Antigravity Agent**: 設定檔通常位於 `~/.gemini/antigravity/mcp_config.json`。您可以將內容合併進去，或是在啟動 Agent 時指定。

2.  **填寫資料庫資訊**：
    打開 `.vscode/mcp.json`，您會看到兩個 Server 的設定 (`mysql` 和 `sequelize-gen`)。
    **請務必修改 `env` 區塊中的資料庫連線資訊**，使其符合您的本地 MySQL 設定：

    ```json
    "env": {
      "MYSQL_HOST": "127.0.0.1",
      "MYSQL_PORT": "3306",
      "MYSQL_USER": "您的帳號 (例如 root)",
      "MYSQL_PASS": "您的密碼",
      "MYSQL_DB": "您的資料庫名稱 (例如 cbs)"
    }
    ```
    *(注意：兩個 Server 都需要設定這些變數)*

3.  **重新載入視窗**：
    設定完成後，請務必 **Reload Window (重載視窗)** 或重啟您的 IDE，新的 MCP Server 才會生效。

### 3. 如何使用

設定成功後，您可以直接在 Chat 視窗中對 AI 下達自然語言指令：

#### A. 查詢資料庫結構與內容 (由 `mysql` Server 提供)
您不再需要手動查表，直接問 AI：
> - 「列出 `user` 表的所有欄位」
> - 「`chat_messages` 表裡面前 5 筆資料是什麼？」
> - 「幫我檢查資料庫裡有沒有 `vip_users` 這張表？」

#### B. 生成程式碼 (由 `sequelize-gen` Server 提供)
我們客製化了一個 Prompt 工具，可以讓 AI 直接讀取資料庫 Schema 並生成符合專案規範的 TypeScript 程式碼：

> **指令範例：**
> 「使用 `generate-sequelize` Prompt 幫我產生 `user_betting` 表的 Model 和 Controller」

AI 會自動：
1. 讀取 `user_betting` 的 Table Schema。
2. 根據專案的 TypeScript/Sequelize 規範 (Decorator, TypeORM Style) 生成 Model。
3. 生成對應的 Express Controller (包含 CRUD)。

## 執行專案

啟動開發模式 (支援熱重載)：
```bash
npm run dev
```

伺服器預設會運行在 `http://localhost:3000`。

## API 使用文件 (HTTP 模式)

如果您不使用 Agent，也可以透過 HTTP API 來操作：

### 詢問資料庫
**Endpoint**: `POST /ask-db`
... (略，維持原樣)

## 技術棧

- Node.js & TypeScript
- Express
- LangChain
- Google Gemini (gemini-2.5-flash)
- TypeORM (MySQL)
- Zod
- **Model Context Protocol (MCP)**
