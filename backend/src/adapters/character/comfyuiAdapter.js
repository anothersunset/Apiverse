import axios from 'axios';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getWorkflowDir, toPublicUrl } from '../../config/storage.js';
import { mockCharacter } from './mockAdapter.js';

// 本地 ComfyUI 需要用户提供 workflow JSON。未启用时回退到 mock。
export async function comfyuiCharacter(character, ctx) {
  const base = process.env.COMFYUI_BASE_URL;
  if (!base) return mockCharacter(character, ctx);
  try {
    await axios.get(`${base}/system_stats`, { timeout: 3000 });
  } catch {
    return mockCharacter(character, ctx);
  }
  // 留为高级用户自定义的 workflow.json 提交点（详见 VIDEO_PIPELINE.md）
  return mockCharacter(character, ctx);
}
