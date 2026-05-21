import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { execSync } from 'node:child_process';

// 优先使用系统 ffmpeg；找不到再回退到 npm 安装的二进制
function resolveBinary(systemName, fallback) {
  try {
    const p = execSync(`which ${systemName}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (p) return p;
  } catch {}
  return fallback;
}

ffmpeg.setFfmpegPath(resolveBinary('ffmpeg', ffmpegInstaller.path));
ffmpeg.setFfprobePath(resolveBinary('ffprobe', ffprobeInstaller.path));

export { ffmpeg };
export default ffmpeg;
