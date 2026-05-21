import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';

export const STORAGE_ROOT = path.resolve(process.env.STORAGE_ROOT || './storage');
export const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:5000';

fs.mkdirSync(STORAGE_ROOT, { recursive: true });

export function getWorkflowDir(workflowId) {
  const dir = path.join(STORAGE_ROOT, 'workflows', workflowId);
  return dir;
}

export async function ensureWorkflowDirs(workflowId) {
  const root = getWorkflowDir(workflowId);
  await Promise.all([
    fsp.mkdir(path.join(root, 'shots'), { recursive: true }),
    fsp.mkdir(path.join(root, 'chars'), { recursive: true }),
    fsp.mkdir(path.join(root, 'voice'), { recursive: true }),
    fsp.mkdir(path.join(root, 'tmp'),   { recursive: true }),
  ]);
  return root;
}

/** 把绝对路径转换成可通过 /static 访问的 URL */
export function toPublicUrl(absPath) {
  const rel = path.relative(STORAGE_ROOT, absPath).split(path.sep).join('/');
  return `${PUBLIC_BASE_URL}/static/${rel}`;
}
