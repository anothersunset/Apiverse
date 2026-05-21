import { ffmpeg } from '../../config/ffmpeg.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getWorkflowDir, toPublicUrl, STORAGE_ROOT } from '../../config/storage.js';

// 将 URL 转为本地绝对路径。仅处理本地 /static 资源。
function urlToLocal(url) {
  if (!url) return null;
  const idx = url.indexOf('/static/');
  if (idx < 0) return url;
  return path.join(STORAGE_ROOT, url.slice(idx + '/static/'.length));
}

export async function composeFinal(wf) {
  const root = getWorkflowDir(wf.workflowId);
  const tmp = path.join(root, 'tmp');
  await fs.mkdir(tmp, { recursive: true });

  // 1) 拼接列表
  const listFile = path.join(tmp, 'concat.txt');
  const lines = wf.script.scenes
    .filter((s) => s.videoUrl)
    .map((s) => `file '${urlToLocal(s.videoUrl).replace(/'/g, "'\\''")}'`)
    .join('\n');
  await fs.writeFile(listFile, lines);

  const concatMp4 = path.join(tmp, 'concat.mp4');
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(listFile)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .save(concatMp4)
      .on('end', resolve)
      .on('error', reject);
  });

  // 2) 混音
  const finalMp4 = path.join(root, 'final.mp4');
  const voiceLocal = urlToLocal(wf.voice?.voiceoverUrl);
  if (voiceLocal) {
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatMp4)
        .input(voiceLocal)
        .outputOptions([
          '-map 0:v:0',
          '-map 1:a:0',
          '-c:v copy',
          '-c:a aac',
          '-shortest',
        ])
        .save(finalMp4)
        .on('end', resolve)
        .on('error', reject);
    });
  } else {
    await fs.rename(concatMp4, finalMp4);
  }

  // 3) 封面
  const coverPng = path.join(root, 'cover.png');
  await new Promise((resolve, reject) => {
    ffmpeg(finalMp4)
      .screenshots({
        timestamps: ['00:00:01.000'],
        filename: 'cover.png',
        folder: root,
        size: '720x1280',
      })
      .on('end', resolve)
      .on('error', reject);
  });

  return {
    finalVideoUrl: toPublicUrl(finalMp4),
    coverUrl: toPublicUrl(coverPng),
  };
}
