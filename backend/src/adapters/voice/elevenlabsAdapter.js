import axios from 'axios';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getWorkflowDir, toPublicUrl } from '../../config/storage.js';
import { mockVoice } from './mockAdapter.js';

export async function elevenlabsVoice(text, ctx) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return mockVoice(text, ctx);
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
  const res = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    { text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.7 } },
    { headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' }, responseType: 'arraybuffer', timeout: 120000 }
  );
  const dir = path.join(getWorkflowDir(ctx.workflowId), 'voice');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, 'voiceover.mp3');
  await fs.writeFile(file, res.data);
  return { voiceoverUrl: toPublicUrl(file) };
}
