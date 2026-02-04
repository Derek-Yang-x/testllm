
import fs from 'fs';
import path from 'path';

// Get directories from command line args, ignoring the first two (node, script)
const args = process.argv.slice(2);

// Default directories if no args provided (Backward Compatibility)
const defaultDirs = [
    'src/generated/models',
    'src/generated/controllers',
    'src/generated/routes',
    'src/generated/frontend',
    'test'
];

const dirsToCreate = args.length > 0 ? args : defaultDirs;

if (args.length === 0) {
    console.log("No directories specified, using defaults:", defaultDirs);
}

dirsToCreate.forEach(dir => {
    const fullPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created directory: ${dir}`);
    } else {
        // console.log(`Directory exists: ${dir}`); // Reduce noise
    }
});
