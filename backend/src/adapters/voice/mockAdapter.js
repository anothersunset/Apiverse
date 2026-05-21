import { ffmpeg } from '../../config/ffmpeg.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getWorkflowDir, toPublicUrl } from '../../config/storage.js';

export async function mockVoice(text, ctx) {
  const dir = path.join(getWorkflowDir(ctx.workflowId), 'voice');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, 'voiceover.mp3');
  // 以估算时长生成一段低频正弦波（足够验证音频管道）
  const dur = Math.max(6, Math.min(60, Math.round(text.length / 6)));
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(`sine=frequency=220:duration=${dur}`)
      .inputFormat('lavfi')
      .audioFilters('volume=0.15')
      .audioCodec('libmp3lame')
      .save(file)
      .on('end', resolve)
      .on('error', reject);
  });
  return { voiceoverUrl: toPublicUrl(file), durationSec: dur };
}
