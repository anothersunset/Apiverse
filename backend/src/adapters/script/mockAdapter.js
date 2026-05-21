import { v4 as uuid } from 'uuid';

export async function mockScript({ topic, sceneCount = 3, durationSec = 18, style = 'cinematic' }) {
  const per = Math.round(durationSec / sceneCount);
  const scenes = Array.from({ length: sceneCount }, (_, i) => ({
    sceneId: `s${i + 1}`,
    shotPrompt: `${style} shot ${i + 1} about "${topic}", dynamic camera, vivid colors`,
    voiceover: `镜头 ${i + 1}：关于 ${topic} 的一幕。`,
    durationSec: per,
    status: 'pending',
  }));
  return {
    logline: `一部关于 ${topic} 的 ${style} 短片`,
    scenes,
    characters: [{ characterId: `c_${uuid().slice(0, 6)}`, name: '主角', visualPrompt: `${style} portrait, hero of "${topic}"` }],
  };
}
