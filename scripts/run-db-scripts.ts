
import { spawn } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const {
    DB_USER,
    DB_PASS,
    DB_HOST = 'localhost',
    DB_PORT = '27017',
    DB_NAME = 'test',
    MONGODB_URI
} = process.env;

// Construct Connection String
// Priority: MONGODB_URI > Constructed URI
let connectionString = MONGODB_URI;

if (!connectionString) {
    if (DB_USER && DB_PASS) {
        connectionString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
    } else {
        connectionString = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    }
}

// Get script file from arguments
const scriptArg = process.argv[2];

if (!scriptArg) {
    console.error('Error: Please provide a script file to execute or use --eval.');
    console.error('Usage: \n  npx tsx scripts/run-db-scripts.ts <path/to/script.js>\n  npx tsx scripts/run-db-scripts.ts --eval "print(1)"');
    process.exit(1);
}

let mongoshArgs: string[] = [connectionString];

if (scriptArg === '--eval') {
    const code = process.argv[3];
    if (!code) {
        console.error('Error: Please provide code to evaluate after --eval.');
        process.exit(1);
    }
    mongoshArgs.push('--eval', code);
    console.log(`\n🔌 Connecting to: ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    console.log(`📜 Executing Code: ${code}`);
} else {
    // Resolve script path
    // Try relative to current cwd first, then try relative to scripts/db if not found
    let scriptPath = path.resolve(process.cwd(), scriptArg);

    if (!fs.existsSync(scriptPath)) {
        // Try looking in standard locations
        const pathsToCheck = [
            path.resolve(process.cwd(), 'src', 'generated', 'db', scriptArg),
            path.resolve(process.cwd(), 'scripts', 'db', scriptArg),
            path.resolve(process.cwd(), 'scripts', scriptArg)
        ];

        let found = false;
        for (const p of pathsToCheck) {
            if (fs.existsSync(p)) {
                scriptPath = p;
                found = true;
                break;
            }
        }

        if (!found) {
            console.error(`Error: Script file not found: ${scriptArg}`);
            console.error(`Checked paths:\n- ${process.cwd()}/${scriptArg}\n- ${pathsToCheck.join('\n- ')}`);
            process.exit(1);
        }
    }

    mongoshArgs.push(scriptPath);
    console.log(`\n🔌 Connecting to: ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    console.log(`📜 Executing Script: ${scriptPath}`);
}

console.log('--- Output Start ---\n');

// Configure environment for the child process to suppress mongosh startup warnings if possible
const env = {
    ...process.env,
    // Add any mongosh specific env vars if needed
};

// Spawn mongosh
const mongosh = spawn('mongosh', mongoshArgs, {
    env,
    stdio: 'inherit', // Pipe stdin/out/err directly to parent console
    shell: false // Disable shell execution to avoid escaping issues with special characters in args
});

mongosh.on('close', (code) => {
    console.log('\n--- Output End ---');
    if (code === 0) {
        console.log('✅ Script executed successfully.');
    } else {
        console.error(`❌ Script failed with exit code ${code}`);
    }
    process.exit(code || 0);
});

mongosh.on('error', (err) => {
    console.error('Failed to start mongosh. Make sure MongoDB Shell is installed.');
    console.error(err);
    process.exit(1);
});
