import { mockShot } from './mockAdapter.js';
import { klingShot } from './klingAdapter.js';
import { veoShot } from './veoAdapter.js';
import { runwayShot } from './runwayAdapter.js';

export async function renderShot(scene, ctx) {
  const provider = ctx.providers?.video || process.env.VIDEO_PROVIDER || 'mock';
  switch (provider) {
    case 'kling':  return klingShot(scene, ctx);
    case 'veo':    return veoShot(scene, ctx);
    case 'runway': return runwayShot(scene, ctx);
    default:       return mockShot(scene, ctx);
  }
}
