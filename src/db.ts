import { DataSource } from "typeorm"
import dotenv from "dotenv"

dotenv.config()

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "passwd",
  database: process.env.DB_NAME || "cbs",
  synchronize: false, // AI 專案建議設為 false，避免自動改表
  logging: true,
})