# Text-to-SQL API Service

這是一個使用 TypeScript、Express、LangChain 和 Google Gemini 2.5 Flash 模型構建的 Text-to-SQL API 服務。它可以理解您的自然語言問題，自動生成對應的 SQL 查詢語法，並從資料庫中檢索資料。

## 功能特色

- **自然語言轉 SQL**: 使用 Google Gemini 先進的 AI 模型將問題轉換為精確的 SQL。
- **安全性**: 使用參數化查詢 (Parameterized Queries) 來防止 SQL Injection 攻擊。
- **結構化輸出**: 利用 Zod 定義輸出格式，確保 AI 生成的回應符合預期。
- **TypeScript**: 完整的型別定義，開發維護更安全。

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

## 執行專案

啟動開發模式 (支援熱重載)：
```bash
npm run dev
```

伺服器預設會運行在 `http://localhost:3000`。

## API 使用文件

### 詢問資料庫

**Endpoint**: `POST /ask-db`

**Request Body**:
```json
{
  "question": "請列出最近註冊的 5 位使用者"
}
```

**Response Example**:
```json
{
  "question": "請列出最近註冊的 5 位使用者",
  "generated_sql": "SELECT * FROM users ORDER BY created_at DESC LIMIT ?",
  "generated_params": [5],
  "result": [
    { "id": 1, "name": "User A", "created_at": "..." },
    { "id": 2, "name": "User B", "created_at": "..." }
  ]
}
```

## 技術棧

- Node.js & TypeScript
- Express
- LangChain
- Google Gemini (gemini-2.5-flash)
- TypeORM (MySQL)
- Zod
