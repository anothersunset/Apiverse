import axios from 'axios';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getWorkflowDir, toPublicUrl } from '../../config/storage.js';
import { mockCharacter } from './mockAdapter.js';

export async function fluxCharacter(character, ctx) {
  if (!process.env.REPLICATE_API_TOKEN && !process.env.FAL_KEY) {
    return mockCharacter(character, ctx);
  }
  // 默认使用 fal.ai 的 flux.schnell
  if (process.env.FAL_KEY) {
    const res = await axios.post('https://fal.run/fal-ai/flux/schnell', {
      prompt: character.visualPrompt,
      image_size: 'square_hd',
    }, { headers: { Authorization: `Key ${process.env.FAL_KEY}` }, timeout: 90000 });
    const url = res.data?.images?.[0]?.url;
    if (!url) return mockCharacter(character, ctx);
    const buf = await axios.get(url, { responseType: 'arraybuffer' });
    const dir = path.join(getWorkflowDir(ctx.workflowId), 'chars');
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, `${character.characterId}.png`);
    await fs.writeFile(file, buf.data);
    return { ...character, referenceImageUrl: toPublicUrl(file) };
  }
  return mockCharacter(character, ctx);
}
