import fs from 'fs/promises';
import path from 'path';

export async function saveCodeToFile(code: string, filename: string) {
  // Strip markdown code blocks if present
  let content = code;
  const codeBlockRegex = /```(?:typescript|tsx|jsx|js)?\n([\s\S]*?)```/;
  const match = code.match(codeBlockRegex);
  if (match) {
    content = match[1] || "";
  }

  const dir = path.dirname(filename);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filename, content);
  console.log(`Code saved to ${filename}`);
  return filename;
}
