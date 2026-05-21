import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getWorkflowDir, toPublicUrl } from '../../config/storage.js';
import { mockShot } from './mockAdapter.js';

function klingJwt() {
  const ak = process.env.KLING_ACCESS_KEY;
  const sk = process.env.KLING_SECRET_KEY;
  if (!ak || !sk) return null;
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    { iss: ak, exp: now + 1800, nbf: now - 5 },
    sk,
    { algorithm: 'HS256', header: { alg: 'HS256', typ: 'JWT' } }
  );
}

export async function klingShot(scene, ctx) {
  const token = klingJwt();
  if (!token) return mockShot(scene, ctx);
  const base = process.env.KLING_BASE_URL || 'https://api.klingai.com';

  const create = await axios.post(`${base}/v1/videos/text2video`, {
    model_name: 'kling-v1',
    prompt: scene.shotPrompt,
    duration: String(scene.durationSec || 5),
    aspect_ratio: ctx.aspectRatio || '9:16',
    mode: 'std',
  }, { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 });

  const taskId = create.data?.data?.task_id;
  if (!taskId) throw new Error('kling: no task_id');

  let videoUrl = null;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const st = await axios.get(`${base}/v1/videos/text2video/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const status = st.data?.data?.task_status;
    if (status === 'succeed') { videoUrl = st.data.data.task_result?.videos?.[0]?.url; break; }
    if (status === 'failed')  throw new Error('kling: task failed');
  }
  if (!videoUrl) throw new Error('kling: timeout');

  const buf = await axios.get(videoUrl, { responseType: 'arraybuffer' });
  const dir = path.join(getWorkflowDir(ctx.workflowId), 'shots');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${scene.sceneId}.mp4`);
  await fs.writeFile(file, buf.data);
  return { videoUrl: toPublicUrl(file), durationSec: scene.durationSec || 5 };
}
