import { mockScript } from './mockAdapter.js';
import { openaiScript } from './openaiAdapter.js';
import { claudeScript } from './claudeAdapter.js';

export async function generateScript(input) {
  const provider = input.providers?.script || process.env.SCRIPT_PROVIDER || 'mock';
  switch (provider) {
    case 'openai': return openaiScript(input);
    case 'claude': return claudeScript(input);
    default:       return mockScript(input);
  }
}
