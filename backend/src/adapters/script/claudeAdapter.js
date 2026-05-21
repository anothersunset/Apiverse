import { mockScript } from './mockAdapter.js';

// Claude：使用 fetch 调用 Anthropic Messages API
export async function claudeScript(input) {
  if (!process.env.ANTHROPIC_API_KEY) return mockScript(input);
  const url = 'https://api.anthropic.com/v1/messages';
  const sys = '你是一个专业的短视频编剧。严格返回 JSON。';
  const user = `主题：${input.topic}\n风格：${input.style}\n总时长：${input.durationSec}秒，镜头数：${input.sceneCount}\n请返回：{"logline":string,"scenes":[{"sceneId":string,"shotPrompt":string,"voiceover":string,"durationSec":number}],"characters":[{"characterId":string,"name":string,"visualPrompt":string}]}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest',
      max_tokens: 2048,
      system: sys,
      messages: [{ role: 'user', content: user }],
    }),
  });
  const data = await res.json();
  const text = data?.content?.[0]?.text || '{}';
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : '{}');
}
