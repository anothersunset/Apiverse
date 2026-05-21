import OpenAI from 'openai';
import { mockScript } from './mockAdapter.js';

export async function openaiScript(input) {
  if (!process.env.OPENAI_API_KEY) return mockScript(input);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const sys = '你是一个专业的短视频编剧。根据主题生成 JSON 脚本，严格返回 JSON。';
  const user = `主题：${input.topic}\n风格：${input.style}\n总时长：${input.durationSec}秒，镜头数：${input.sceneCount}\n请返回：{"logline":string,"scenes":[{"sceneId":string,"shotPrompt":string,"voiceover":string,"durationSec":number}],"characters":[{"characterId":string,"name":string,"visualPrompt":string}]}`;
  const resp = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });
  return JSON.parse(resp.choices[0].message.content);
}
