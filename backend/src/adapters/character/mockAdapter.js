import fs from 'node:fs/promises';
import path from 'node:path';
import { getWorkflowDir, toPublicUrl } from '../../config/storage.js';

// 生成一个 512x512 的 SVG，提供名字 + prompt，以证明是真文件
export async function mockCharacter(character, ctx) {
  const dir = path.join(getWorkflowDir(ctx.workflowId), 'chars');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${character.characterId}.svg`);
  const safeName = (character.name || character.characterId).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const safePrompt = (character.visualPrompt || '').slice(0, 80).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <circle cx="256" cy="200" r="96" fill="#fff" opacity="0.85"/>
  <text x="256" y="360" font-size="36" text-anchor="middle" fill="#fff" font-family="sans-serif">${safeName}</text>
  <text x="256" y="410" font-size="18" text-anchor="middle" fill="#fff" opacity="0.85" font-family="sans-serif">${safePrompt}</text>
</svg>`;
  await fs.writeFile(file, svg);
  return { ...character, referenceImageUrl: toPublicUrl(file) };
}
