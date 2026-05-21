import { mockCharacter } from './mockAdapter.js';
import { fluxCharacter } from './fluxAdapter.js';
import { comfyuiCharacter } from './comfyuiAdapter.js';

export async function generateCharacter(character, ctx) {
  const provider = ctx.providers?.character || process.env.CHARACTER_PROVIDER || 'mock';
  switch (provider) {
    case 'flux':    return fluxCharacter(character, ctx);
    case 'comfyui': return comfyuiCharacter(character, ctx);
    default:        return mockCharacter(character, ctx);
  }
}
