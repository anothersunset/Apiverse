import axios from 'axios';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getWorkflowDir, toPublicUrl } from '../../config/storage.js';
import { mockShot } from './mockAdapter.js';

export async function veoShot(scene, ctx) {
  const apiKey = process.env.VEO_API_KEY;
  if (!apiKey) return mockShot(scene, ctx);

  const create = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-001:generateVideos?key=${apiKey}`,
    { instances: [{ prompt: scene.shotPrompt }], parameters: { aspectRatio: ctx.aspectRatio || '9:16', durationSeconds: scene.durationSec || 6 } },
    { timeout: 30000 }
  );
  const opName = create.data?.name;
  if (!opName) throw new Error('veo: no operation name');

  let videoUri = null;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const st = await axios.get(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${apiKey}`);
    if (st.data?.done) { videoUri = st.data?.response?.generatedVideos?.[0]?.video?.uri; break; }
  }
  if (!videoUri) throw new Error('veo: timeout');

  const buf = await axios.get(videoUri, { responseType: 'arraybuffer', headers: { 'x-goog-api-key': apiKey } });
  const dir = path.join(getWorkflowDir(ctx.workflowId), 'shots');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${scene.sceneId}.mp4`);
  await fs.writeFile(file, buf.data);
  return { videoUrl: toPublicUrl(file), durationSec: scene.durationSec || 6 };
}
