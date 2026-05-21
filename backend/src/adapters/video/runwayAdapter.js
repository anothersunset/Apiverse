import axios from 'axios';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getWorkflowDir, toPublicUrl } from '../../config/storage.js';
import { mockShot } from './mockAdapter.js';

export async function runwayShot(scene, ctx) {
  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) return mockShot(scene, ctx);

  const create = await axios.post('https://api.dev.runwayml.com/v1/image_to_video', {
    model: 'gen3a_turbo',
    promptText: scene.shotPrompt,
    duration: scene.durationSec || 5,
    ratio: ctx.aspectRatio === '9:16' ? '768:1280' : '1280:768',
  }, {
    headers: { Authorization: `Bearer ${apiKey}`, 'X-Runway-Version': '2024-11-06' },
    timeout: 30000,
  });

  const taskId = create.data?.id;
  if (!taskId) throw new Error('runway: no task id');

  let videoUrl = null;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const st = await axios.get(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}`, 'X-Runway-Version': '2024-11-06' },
    });
    if (st.data?.status === 'SUCCEEDED') { videoUrl = st.data.output?.[0]; break; }
    if (st.data?.status === 'FAILED')    throw new Error('runway: failed');
  }
  if (!videoUrl) throw new Error('runway: timeout');

  const buf = await axios.get(videoUrl, { responseType: 'arraybuffer' });
  const dir = path.join(getWorkflowDir(ctx.workflowId), 'shots');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${scene.sceneId}.mp4`);
  await fs.writeFile(file, buf.data);
  return { videoUrl: toPublicUrl(file), durationSec: scene.durationSec || 5 };
}
