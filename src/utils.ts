import fs from 'fs/promises';
import path from 'path';

import prettier from 'prettier';

export async function saveCodeToFile(code: string, filename: string) {
  // Strip markdown code blocks if present
  let content = code;
  const codeBlockRegex = /```(?:typescript|tsx|jsx|js)?\n([\s\S]*?)```/;
  const match = code.match(codeBlockRegex);
  if (match) {
    content = match[1] || "";
  }
  
  // Ensure escaped newlines are properly formatted
  content = content.replace(/\\n/g, '\n');

  // Try to format with Prettier
  try {
    const ext = path.extname(filename);
    let parser = 'typescript'; // default
    if (ext === '.json') parser = 'json';
    if (ext === '.js' || ext === '.jsx') parser = 'babel';
    if (ext === '.html') parser = 'html';
    if (ext === '.css') parser = 'css';
    
    content = await prettier.format(content, { parser });
  } catch (err) {
    console.warn(`Prettier formatting failed for ${filename}:`, err);
    // Proceed with unformatted content
  }

  const dir = path.dirname(filename);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filename, content);
  console.log(`Code saved to ${filename}`);
  return filename;
}
