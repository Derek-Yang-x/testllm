import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Load .env
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

async function main() {
    console.log('🚀 Setting up MCP Configuration...');

    // 1. Detect Environment
    const NODE_PATH = process.execPath;
    let NPX_PATH = path.join(path.dirname(NODE_PATH), 'npx');

    // Verify npx exists, fallback to simple 'npx' if not found at expected location
    try {
        await fs.access(NPX_PATH);
    } catch {
        try {
            NPX_PATH = execSync('which npx').toString().trim();
        } catch (e) {
            console.warn('⚠️  Could not locate npx absolute path, falling back to "npx"');
            NPX_PATH = 'npx';
        }
    }

    console.log(`📍 Detected Project Root: ${PROJECT_ROOT}`);
    console.log(`📍 Detected Node: ${NODE_PATH}`);
    console.log(`📍 Detected NPX: ${NPX_PATH}`);

    // 2. Read Template
    const templatePath = path.join(PROJECT_ROOT, 'mcp_config.json.template');
    let content;
    try {
        content = await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
        console.error('❌ Could not find mcp_config.json.template');
        process.exit(1);
    }

    // 3. Replace Placeholders
    // Use .env values for MySQL or defaults
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '3306';
    const dbUser = process.env.DB_USER || 'root';
    const dbPass = process.env.DB_PASS || 'passwd';
    const dbName = process.env.DB_NAME || 'cbs';

    const configString = content
        .replace(/{{PROJECT_ROOT}}/g, PROJECT_ROOT)
        .replace(/{{NODE_PATH}}/g, NODE_PATH)
        .replace(/{{NPX_PATH}}/g, NPX_PATH)
        .replace(/{{MYSQL_HOST}}/g, dbHost)
        .replace(/{{MYSQL_PORT}}/g, dbPort)
        .replace(/{{MYSQL_USER}}/g, dbUser)
        .replace(/{{MYSQL_PASS}}/g, dbPass)
        .replace(/{{MYSQL_DB}}/g, dbName);

    // Parse JSON to handle conditional logic
    const configObj = JSON.parse(configString);

    if (process.env.DB_TYPE === 'mongo') {
        console.log('ℹ️  DB_TYPE is mongo, removing MySQL MCP server config...');
        if (configObj.mcpServers && configObj.mcpServers.mysql) {
            delete configObj.mcpServers.mysql;
        }
    }

    const config = JSON.stringify(configObj, null, 2);

    // 4. Write output
    const outputPath = path.join(PROJECT_ROOT, 'mcp_config.json');
    await fs.writeFile(outputPath, config);

    console.log(`✅ generated: ${outputPath}`);
    console.log('\n📋 INSTRUCTIONS:');

    console.log('--- For Claude Desktop Users ---');
    console.log('1. Open Config: ~/Library/Application Support/Claude/claude_desktop_config.json');
    console.log('2. Copy the contents of mcp_config.json into "mcpServers" block.');
    console.log('3. Restart Claude Desktop.');

    console.log('\n--- For Antigravity Users ---');
    console.log('1. Open Config: ~/.gemini/antigravity/mcp_config.json');
    console.log('2. Copy the contents of mcp_config.json into "mcpServers" block.');
}

main().catch(console.error);
