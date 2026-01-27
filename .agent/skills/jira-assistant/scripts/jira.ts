import https from 'https';
import { URL } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const JIRA_URL = process.env.JIRA_URL || "";
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || "";

if (!JIRA_URL || !JIRA_API_TOKEN) {
    console.error("Error: JIRA_URL and JIRA_API_TOKEN environment variables must be set.");
    process.exit(1);
}

const command = process.argv[2];
const argument = process.argv[3];

if (!command) {
    console.error("Usage: npx tsx jira.ts <search|get> <argument>");
    process.exit(1);
}

// Ignore self-signed certs
const agent = new https.Agent({
    rejectUnauthorized: false
});

interface JiraIssue {
    key: string;
    fields: {
        summary: string;
        status: { name: string };
        description?: string;
    }
}

interface JiraSearchResponse {
    issues: JiraIssue[];
    errorMessages?: string[];
}

function makeRequest<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => {
        // Robust URL construction
        const baseUrl = JIRA_URL.replace(/\/$/, '');
        const apiPath = baseUrl.endsWith('/jira') ? '/rest/api/2' : '/jira/rest/api/2';
        const fullUrl = new URL(baseUrl + apiPath + path);

        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${JIRA_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            agent
        };

        const req = https.request(fullUrl, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 400) {
                    try {
                        const err = JSON.parse(data);
                        const msg = err.errorMessages ? err.errorMessages.join(', ') : `HTTP ${res.statusCode}`;
                        reject(new Error(msg));
                    } catch (e) {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                } else {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error("Invalid JSON response"));
                    }
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function search(jql: string) {
    try {
        const data = await makeRequest<JiraSearchResponse>(`/search?jql=${encodeURIComponent(jql)}&maxResults=10&fields=key,summary,status`);
        const issues = data.issues || [];
        if (issues.length === 0) {
            console.log("No issues found.");
            return;
        }
        console.log(`${"Key".padEnd(10)} ${"Status".padEnd(12)} Summary`);
        console.log("-".repeat(80));
        issues.forEach(i => {
            console.log(`${i.key.padEnd(10)} ${i.fields.status.name.padEnd(12)} ${i.fields.summary}`);
        });
    } catch (error: any) {
        console.error("Search Error:", error.message);
        process.exit(1);
    }
}

async function getIssue(key: string) {
    try {
        const i = await makeRequest<JiraIssue>(`/issue/${key}`);
        const description = (i.fields.description || "No description");
        console.log(`[${i.key}] ${i.fields.summary}`);
        console.log("=".repeat(80));
        console.log(`Status: ${i.fields.status.name}`);
        console.log("-".repeat(80));
        console.log("Description:");
        console.log(description);
    } catch (error: any) {
        console.error("Get Issue Error:", error.message);
        process.exit(1);
    }
}

async function main() {
    if (command === 'search') {
        if (!argument) {
            console.error("Error: JQL argument required for search.");
            process.exit(1);
        }
        await search(argument);
    } else if (command === 'get') {
        if (!argument) {
            console.error("Error: Issue Key argument required for get.");
            process.exit(1);
        }
        await getIssue(argument);
    } else {
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
}

main();
