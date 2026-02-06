import fs from 'fs/promises';
import path from 'path';

const templateDir = path.resolve(process.cwd(), 'backend', 'templates');

export async function listTemplates() {
  const entries = await fs.readdir(templateDir);
  return entries.filter((name) => name.endsWith('.json'));
}

export async function loadTemplate(name) {
  const safeName = name.replace(/[^a-z0-9-_.]/gi, '');
  const filePath = path.join(templateDir, safeName);
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}
