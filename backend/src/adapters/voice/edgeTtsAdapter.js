import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getWorkflowDir, toPublicUrl } from '../../config/storage.js';
import { mockVoice } from './mockAdapter.js';

// 需要系统安装 edge-tts (pip install edge-tts)
export async function edgeTtsVoice(text, ctx) {
  const dir = path.join(getWorkflowDir(ctx.workflowId), 'voice');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, 'voiceover.mp3');
  try {
    await new Promise((resolve, reject) => {
      const proc = spawn('edge-tts', ['--text', text, '--voice', 'zh-CN-XiaoxiaoNeural', '--write-media', file]);
      proc.on('error', reject);
      proc.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`edge-tts exit ${code}`))));
    });
    return { voiceoverUrl: toPublicUrl(file) };
  } catch (e) {
    console.warn('[edgeTtsAdapter] fallback to mock:', e.message);
    return mockVoice(text, ctx);
  }
}
