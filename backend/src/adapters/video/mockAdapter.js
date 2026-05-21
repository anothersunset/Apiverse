import { ffmpeg } from '../../config/ffmpeg.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getWorkflowDir, toPublicUrl } from '../../config/storage.js';

export async function mockShot(scene, ctx) {
  const dir = path.join(getWorkflowDir(ctx.workflowId), 'shots');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${scene.sceneId}.mp4`);
  const dur = scene.durationSec || 6;
  const colors = ['indigo', 'magenta', 'teal', 'orange', 'crimson', 'forestgreen'];
  const color = colors[parseInt(scene.sceneId.replace(/\D/g, ''), 10) % colors.length] || 'navy';
  const text = (scene.shotPrompt || scene.sceneId).replace(/'/g, '').slice(0, 50);

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(`color=c=${color}:s=1080x1920:d=${dur}`)
      .inputFormat('lavfi')
      .complexFilter([
        `drawtext=text='${text}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2`,
        `drawtext=text='Scene ${scene.sceneId}':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=h/2-200`,
      ])
      .outputOptions(['-pix_fmt yuv420p', '-r 30', '-c:v libx264', '-preset ultrafast'])
      .save(file)
      .on('end', resolve)
      .on('error', reject);
  });

  return { videoUrl: toPublicUrl(file), durationSec: dur };
}
