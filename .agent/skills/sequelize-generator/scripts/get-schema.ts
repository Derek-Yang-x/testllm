
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DB_TYPE = process.env.DB_TYPE || "mysql";

if (DB_TYPE === 'mongo') {
    console.log(`DB_TYPE is '${DB_TYPE}'. This script is for MySQL. Skipping.`);
    process.exit(0);
}

const DB_CONFIG = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "passwd",
    database: process.env.DB_NAME || "cbs",
};

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log("Usage:");
        console.log("  npx tsx get-schema.ts list");
        console.log("  npx tsx get-schema.ts <table_name>");
        process.exit(0);
    }

    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);

        if (command === 'list') {
            await listTables(connection);
        } else {
            const targetTable = command;
            let tablesToProcess: string[] = [];

            // Check if table exists
            const [tables] = await connection.query('SHOW TABLES LIKE ?', [targetTable]);

            if ((tables as any[]).length > 0) {
                tablesToProcess.push(targetTable);
            } else {
                console.log(`Table '${targetTable}' not found. Inferring schema for ALL available tables...`);
                tablesToProcess = await getAllTables(connection);
            }

            if (tablesToProcess.length === 0) {
                console.log("No tables found in database.");
                return;
            }

            for (const table of tablesToProcess) {
                await describeTable(connection, table);
            }
        }

    } catch (error) {
        console.error("Error connecting or querying MySQL:", error);
    } finally {
        if (connection) await connection.end();
    }
}

async function getAllTables(connection: mysql.Connection): Promise<string[]> {
    const [rows] = await connection.query('SHOW TABLES');
    return (rows as any[]).map(row => Object.values(row)[0] as string);
}

async function listTables(connection: mysql.Connection) {
    const tables = await getAllTables(connection);
    console.log("Available Tables:");
    tables.forEach(t => console.log(`- ${t}`));
}

async function describeTable(connection: mysql.Connection, tableName: string) {
    const [columns] = await connection.query(`DESCRIBE ${tableName}`);

    console.log(`\nSchema for table '${tableName}':`);
    console.log("--------------------------------------------------");
    (columns as any[]).forEach(col => {
        // Field, Type, Null, Key, Default, Extra
        const nullStr = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
        const keyStr = col.Key ? `[${col.Key}]` : '';
        console.log(`${col.Field}: ${col.Type} ${nullStr} ${keyStr}`);
    });
    console.log("--------------------------------------------------");
}

main();
