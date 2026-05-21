import { mockVoice } from './mockAdapter.js';
import { elevenlabsVoice } from './elevenlabsAdapter.js';
import { edgeTtsVoice } from './edgeTtsAdapter.js';

export async function generateVoice(text, ctx) {
  const provider = ctx.providers?.voice || process.env.VOICE_PROVIDER || 'mock';
  switch (provider) {
    case 'elevenlabs': return elevenlabsVoice(text, ctx);
    case 'edgetts':    return edgeTtsVoice(text, ctx);
    default:           return mockVoice(text, ctx);
  }
}
