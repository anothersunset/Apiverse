import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { renderShot } from '../adapters/video/index.js';
import { findWorkflow, saveWorkflow, appendLog } from '../models/VideoWorkflow.js';
import { onShotDone } from '../services/workflowOrchestrator.js';
import { eventBus } from '../services/eventBus.js';

export function startShotWorker() {
  return new Worker('shot-queue', async (job) => {
    const { workflowId, sceneId } = job.data;
    const wf = await findWorkflow(workflowId);
    const scene = wf.script.scenes.find((s) => s.sceneId === sceneId);
    if (!scene) return;
    scene.status = 'running';
    await saveWorkflow(wf);
    eventBus.emitProgress(workflowId, { stage: 'shots', sceneId, status: 'running' });
    try {
      const r = await renderShot(scene, {
        workflowId,
        aspectRatio: wf.input.aspectRatio,
        providers: wf.input.providers,
      });
      scene.status = 'done';
      scene.videoUrl = r.videoUrl;
      scene.durationSec = r.durationSec || scene.durationSec;
      appendLog(wf, 'info', `镜头 ${sceneId} 完成`);
      await saveWorkflow(wf);
      eventBus.emitProgress(workflowId, { stage: 'shots', sceneId, status: 'done', url: r.videoUrl });
      await onShotDone(workflowId);
    } catch (err) {
      scene.status = 'failed';
      scene.errorMsg = err.message;
      appendLog(wf, 'error', `镜头 ${sceneId} 失败：${err.message}`);
      await saveWorkflow(wf);
      eventBus.emitProgress(workflowId, { stage: 'shots', sceneId, status: 'failed', error: err.message });
      throw err;
    }
  }, { connection: redisConnection, concurrency: Number(process.env.SHOT_CONCURRENCY || 2) });
}
