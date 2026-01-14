import { DataSource } from "typeorm"
import { SqlDatabase } from "@langchain/classic/sql_db";
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
  logging: false,
})

// await AppDataSource.initialize();

// Cache for table info
let cachedSchema: string | null = null;
export let db: SqlDatabase;

export async function initializeDb() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  if (!db) {
    db = await SqlDatabase.fromDataSourceParams({ appDataSource: AppDataSource });
  }
}

export async function getSchema() {
  if (!db) await initializeDb();
  if (!cachedSchema) {
    console.error("Fetching table schema from DB...");
    cachedSchema = await db.getTableInfo();
  }
  return cachedSchema;
}

let cachedTableNames: string[] | null = null;

async function getAllTableNames(): Promise<string[]> {
  if (!db) await initializeDb();
  if (cachedTableNames) return cachedTableNames;
  
  // Method 1: Get from AppDataSource directly
  const tables = await AppDataSource.query("SHOW TABLES");
  // Result is like [ { Tables_in_cbs: 'action_log' }, ... ]
  // We need to extract the values
  cachedTableNames = tables.map((row: any) => Object.values(row)[0] as string);
  return cachedTableNames!;
}

export async function getRelevantSchema(question: string): Promise<{ schema: string, tables: string[] }> {
  try {
    const allTables = await getAllTableNames();
    const lowerQuestion = question.toLowerCase();
    
    // Step 1: Local keyword matching
    // Match table names or significant parts (e.g. "order" in "order_items")
    const selectedTables = allTables.filter(table => {
      const lowerTable = table.toLowerCase();
      if (lowerQuestion.includes(lowerTable)) return true;
      
      const parts = lowerTable.split('_');
      return parts.some(part => part.length > 3 && lowerQuestion.includes(part));
    });

    // Step 2: Fallback logic
    let finalTables = selectedTables;
    if (selectedTables.length === 0) {
      console.error("No specific tables matched via keywords. Using all tables as context.");
      finalTables = allTables;
    } else {
      console.error("Selected tables (keyword match):", finalTables);
    }
  
    // Step 3: Get schema
    if (!db) await initializeDb();
    const schema = await db.getTableInfo(finalTables);
    return { schema, tables: finalTables };
  } catch (error) {
    console.error("Error in getRelevantSchema:", error);
    // Fallback safely
    if (!db) {
        return { schema: `Error retrieving schema: Database not connected. Details: ${error}`, tables: [] };
    }
    return { schema: await db.getTableInfo(), tables: [] };
  }
}