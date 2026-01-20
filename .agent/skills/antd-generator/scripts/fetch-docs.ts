
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_URL = "https://ant.design/llms-full.txt";
const OUTPUT_DIR = path.resolve(__dirname, '../resources');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'antd-docs.txt');
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Parse arguments
const args = process.argv.slice(2);
const forceUpdate = args.includes('--force');

// Ensure resources directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Check cache
if (!forceUpdate && fs.existsSync(OUTPUT_FILE)) {
  const stats = fs.statSync(OUTPUT_FILE);
  const now = new Date().getTime();
  const fileAge = now - stats.mtime.getTime();

  if (fileAge < CACHE_DURATION_MS) {
    console.log(`[SmartCache] Docs are fresh (Last updated: ${stats.mtime.toISOString()}). Skipping download.`);
    process.exit(0);
  } else {
    console.log(`[SmartCache] Docs are outdated (Age: ${(fileAge / (1000 * 60 * 60)).toFixed(1)}h). Updating...`);
  }
} else if (forceUpdate) {
  console.log(`[SmartCache] Force update requested.`);
} else {
  console.log(`[SmartCache] Docs missing. Fetching...`);
}

console.log(`Fetching Ant Design documentation from ${DOCS_URL}...`);

https.get(DOCS_URL, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to fetch docs: Status Code ${res.statusCode}`);
    process.exit(1);
  }

  const file = fs.createWriteStream(OUTPUT_FILE);
  res.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log(`Documentation saved to: ${OUTPUT_FILE}`);
    splitDocs();
  });
}).on('error', (err) => {
  console.error(`Error fetching docs: ${err.message}`);
  process.exit(1);
});

function splitDocs() {
  const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
  const sections = content.split(/^### /gm);
  const docsDir = path.join(OUTPUT_DIR, 'docs');

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // First section might be preamble, skip if empty or headerless
  sections.forEach((section) => {
    if (!section.trim()) return;

    // specific handling for the first line which contains the component name
    const lines = section.split('\n');
    // Replace spaces and slashes with hyphens, remove other special chars
    const componentName = lines[0]?.trim().toLowerCase()
      .replace(/[\s\/]+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    if (componentName) {
      const filePath = path.join(docsDir, `${componentName}.md`);
      // Add back the header '### ' for context if needed, or just save content
      fs.writeFileSync(filePath, '### ' + section);
      // console.log(`Generated doc: ${componentName}.md`);
    }
  });
  console.log(`[Split] Documentation split into individual files in ${docsDir}`);
}
