
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPT_TEMPLATE_PATH = path.resolve(__dirname, '../prompts/antd.md');
const DOCS_DIR = path.resolve(__dirname, '../resources/docs');

// Simple keyword matching for retrieval
function getRelevantDocs(request: string): string {
    if (!fs.existsSync(DOCS_DIR)) return '';

    const files = fs.readdirSync(DOCS_DIR);
    // Remove extension for matching
    const components = files.map(f => ({
        name: f.replace('.md', ''),
        file: f
    }));

    const relevantDocs: string[] = [];
    const requestLower = request.toLowerCase();

    components.forEach(comp => {
        // Check if component name appears in request (e.g. "table", "button")
        // Use word boundary to avoid partial matches if possible, or just strict inclusion for now
        if (requestLower.includes(comp.name)) {
            const content = fs.readFileSync(path.join(DOCS_DIR, comp.file), 'utf-8');
            relevantDocs.push(content);
        }
    });

    // Always include some basics if needed, or if no matches found, maybe include a summary?
    // For now, if empty, we might want to warn or just return empty string.
    return relevantDocs.join('\n\n');
}

async function main() {
    const request = process.argv[2];
    if (!request) {
        console.error('Please provide the user request as an argument.');
        process.exit(1);
    }

    const template = fs.readFileSync(PROMPT_TEMPLATE_PATH, 'utf-8');
    const context = getRelevantDocs(request);

    // If no context found, maybe use a default or empty
    const finalPrompt = template
        .replace('{{context}}', context || "No specific component documentation found. Use general Ant Design knowledge.")
        .replace('{input}', request)
        .replace('{{modelContext}}', ''); // Optional: allow passing model context too if needed

    console.log(finalPrompt);
}

main();
