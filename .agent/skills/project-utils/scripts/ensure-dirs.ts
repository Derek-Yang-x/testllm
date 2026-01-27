
import fs from 'fs';
import path from 'path';

const dirs = [
    'src/generated/models',
    'src/generated/controllers',
    'src/generated/routes',
    'src/generated/frontend',
    'test'
];

dirs.forEach(dir => {
    const fullPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created directory: ${dir}`);
    } else {
        console.log(`Directory exists: ${dir}`);
    }
});
