
import { DataSource, type DataSourceOptions } from "typeorm";
import { SqlDatabase } from "@langchain/classic/sql_db";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Configuration
// Default to 'mysql' to preserve backward compatibility if not set
const DB_TYPE = process.env.DB_TYPE || "mysql"; // 'mysql' | 'mongo'

// Database Configuration
// MongoDB Configuration
const getMongoUri = () => {
    if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
    
    // Prioritize MONGO_ prefixed variables, fall back to shared HOST/NAME, 
    // but avoid DB_PORT/USER/PASS defaults which are likely MySQL-specific.
    const host = process.env.DB_HOST || "localhost";
    const port = process.env.DB_PORT || "27017"; // Default to 27017, ignore DB_PORT (3306)
    const dbName = process.env.DB_NAME || "cbs";
    const user = process.env.DB_USER || "root";
    const pass = process.env.DB_PASS || "passwd";

    if (user && pass) {
      return `mongodb://${user}:${pass}@${host}:${port}/${dbName}?authSource=admin`;
    }
    return `mongodb://${host}:${port}/${dbName}`;
};


const options: DataSourceOptions =
  DB_TYPE === "mongo"
    ? {
        type: "mongodb",
        url: getMongoUri(),
        authSource: "admin",
        synchronize: false,
        logging: false,
        entities: [],
      }
    : {
        type: "mysql",
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASS || "passwd",
        database: process.env.DB_NAME || "cbs",
        synchronize: false, // AI 專案建議設為 false，避免自動改表
        logging: false,
      };

export const AppDataSource = new DataSource(options);

// MongoDB Configuration


const MONGODB_URI = getMongoUri();

// LangChain SQL Helper
let cachedSchema: string | null = null;
export let db: SqlDatabase;

// Initialization
export async function initializeDb() {
  console.log(`[DB] Initializing database connection for type: ${DB_TYPE}`);
  
  if (DB_TYPE === "mysql") {
    if (!AppDataSource.isInitialized) {
      try {
        await AppDataSource.initialize();
        console.log("✅ MySQL (TypeORM) connected successfully");
      } catch (err) {
        console.error("❌ MySQL connection error:", err);
      }
    }
    if (!db && AppDataSource.isInitialized) {
      db = await SqlDatabase.fromDataSourceParams({ appDataSource: AppDataSource });
    }
  } else if (DB_TYPE === "mongo") {
    if (mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB (Mongoose) connected successfully");
      } catch (err) {
        console.error("❌ MongoDB connection error:", err);
      }
    }
  } else {
    console.error(`❌ Unknown DB_TYPE: ${DB_TYPE}`);
  }
}

// Helpers
let cachedTableNames: string[] | null = null;
async function getAllTableNames(): Promise<string[]> {
  if (DB_TYPE !== "mysql") return [];
  if (!db) await initializeDb();
  if (cachedTableNames) return cachedTableNames;

  try {
      const tables = await AppDataSource.query("SHOW TABLES");
      // Result is like [ { Tables_in_cbs: 'action_log' }, ... ]
      cachedTableNames = tables.map((row: any) => Object.values(row)[0] as string);
      return cachedTableNames!;
  } catch (err) {
      console.error("Error fetching table names:", err);
      return [];
  }
}

export async function getSchema() {
  if (DB_TYPE === "mysql") {
    if (!db) await initializeDb();
    if (!cachedSchema && db) {
      console.error("Fetching table schema from DB...");
      cachedSchema = await db.getTableInfo();
    }
    return cachedSchema || "";
  } else if (DB_TYPE === "mongo") {
     if (mongoose.connection.readyState === 0) await initializeDb();
     try {
       // @ts-ignore - native db access
       const collections = await mongoose.connection.db.listCollections().toArray();
       const names = collections.map(c => c.name);
       return `MongoDB Collections: ${names.join(", ")}`;
     } catch (error) {
       return `Error fetching MongoDB collections: ${error}`;
     }
  }
  return "";
}

export async function getRelevantSchema(question: string): Promise<{ schema: string, tables: string[] }> {
  if (DB_TYPE === "mysql") {
      // Original MySQL Logic
      try {
        const allTables = await getAllTableNames();
        const lowerQuestion = question.toLowerCase();
        
        const selectedTables = allTables.filter(table => {
          const lowerTable = table.toLowerCase();
          if (lowerQuestion.includes(lowerTable)) return true;
          const parts = lowerTable.split('_');
          return parts.some(part => part.length > 3 && lowerQuestion.includes(part));
        });

        let finalTables = selectedTables;
        if (selectedTables.length === 0) {
          console.error("No specific tables matched via keywords. Using all tables as context.");
          finalTables = allTables;
        } else {
          console.error("Selected tables (keyword match):", finalTables);
        }
      
        if (!db) await initializeDb();
        if (db) {
            const schema = await db.getTableInfo(finalTables);
            return { schema, tables: finalTables };
        }
        return { schema: "Database not connected", tables: [] };
      } catch (error) {
        console.error("Error in getRelevantSchema:", error);
         if (db) {
            return { schema: await db.getTableInfo(), tables: [] };
         }
         return { schema: `Error: ${error}`, tables: [] };
      }
  } else {
      // MongoDB Logic (Simplified)
      const schema = await getSchema();
      return { schema: schema as string, tables: [] };
  }
}