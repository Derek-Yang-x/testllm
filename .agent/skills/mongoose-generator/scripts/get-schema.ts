
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const DB_TYPE = process.env.DB_TYPE || "mysql";

if (DB_TYPE !== 'mongo') {
    console.log(`DB_TYPE is '${DB_TYPE}', skipping MongoDB schema inference.`);
    process.exit(0);
}

const getMongoUri = () => {
    if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

    const host = process.env.DB_HOST || "localhost";
    const port = process.env.DB_PORT || "27017";
    const dbName = process.env.DB_NAME || "cbs";
    const user = process.env.DB_USER || "root";
    const pass = process.env.DB_PASS || "passwd";

    if (user && pass) {
        return `mongodb://${user}:${pass}@${host}:${port}/${dbName}?authSource=admin`;
    }
    return `mongodb://${host}:${port}/${dbName}`;
};

const MONGODB_URI = getMongoUri();

if (!MONGODB_URI) {
    console.error("Error: Could not construct MONGODB_URI.");
    process.exit(1);
}

async function inferSchema(targetCollection: string) {
    try {
        await mongoose.connect(MONGODB_URI as string);
        const db = mongoose.connection.db;
        if (!db) throw new Error("Database connection failed");

        let collectionsToProcess: string[] = [];

        // Check if collection exists
        // listCollections returns a cursor in native driver, but mongoose might wrap it.
        // In previous code: await mongoose.connection.db?.listCollections({ name: collectionName }).toArray();
        const matched = await db.listCollections({ name: targetCollection }).toArray();

        if (matched.length > 0) {
            collectionsToProcess.push(targetCollection);
        } else {
            console.log(`Collection '${targetCollection}' not found. Inferring schema for ALL available collections...`);
            const allCols = await db.listCollections().toArray();
            collectionsToProcess = allCols.map(c => c.name);
        }

        if (collectionsToProcess.length === 0) {
            console.log("No collections found in database to infer schema from.");
            return;
        }

        for (const colName of collectionsToProcess) {
            await printCollectionSchema(db, colName);
        }

    } catch (error) {
        console.error("Error connecting or reading from DB:", error);
    } finally {
        await mongoose.disconnect();
    }
}

async function printCollectionSchema(db: mongoose.mongo.Db, colName: string) {
    const collection = db.collection(colName);
    const cursor = collection.find({}).limit(5);
    const docs = await cursor.toArray();

    if (docs.length === 0) {
        console.log(`Collection '${colName}' is empty. No schema can be inferred.`);
        return;
    }

    // Simple schema inference
    const schemaPaths: Record<string, Set<string>> = {};

    docs.forEach(doc => {
        traverse(doc, schemaPaths);
    });

    // Format output
    console.log(`\nSchema inferred from collection '${colName}':`);
    console.log("--------------------------------------------------");
    for (const [key, types] of Object.entries(schemaPaths)) {
        console.log(`${key}: ${Array.from(types).join('|')}`);
    }
    console.log("--------------------------------------------------");
}

function traverse(obj: any, schemaPaths: Record<string, Set<string>>, prefix = '') {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const fullPath = prefix ? `${prefix}.${key}` : key;
            const type = getType(value);

            if (!schemaPaths[fullPath]) {
                schemaPaths[fullPath] = new Set();
            }
            schemaPaths[fullPath].add(type);

            if (type === 'Object' && value !== null && !Array.isArray(value)) {
                traverse(value, schemaPaths, fullPath);
            } else if (Array.isArray(value) && value.length > 0) {
                // Inspect first element of array to guess type (simplified)
                const elemType = getType(value[0]);
                if (elemType === 'Object') {
                    traverse(value[0], schemaPaths, `${fullPath}.$`);
                } else {
                    if (!schemaPaths[`${fullPath}.$`]) {
                        schemaPaths[`${fullPath}.$`] = new Set();
                    }
                    schemaPaths[`${fullPath}.$`].add(elemType);
                }
            }
        }
    }
}

function getType(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (value instanceof mongoose.Types.ObjectId) return 'ObjectId';
    if (value instanceof Date) return 'Date';
    if (Array.isArray(value)) return 'Array';
    return typeof value;
}

const args = process.argv.slice(2);
const collectionName = args[0];

if (!collectionName || collectionName === 'list') {
    listCollections();
} else {
    inferSchema(collectionName);
}

async function listCollections() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        const db = mongoose.connection.db;
        if (!db) throw new Error("Database connection failed");

        const collections = await db.listCollections().toArray();
        console.log("Available Collections:");
        collections.forEach(c => console.log(`- ${c.name}`));

    } catch (error) {
        console.error("Error listing collections:", error);
    } finally {
        await mongoose.disconnect();
    }
}
