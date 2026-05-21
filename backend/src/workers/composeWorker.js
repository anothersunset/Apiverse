import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { composeFinal } from '../adapters/compose/ffmpegAdapter.js';
import { findWorkflow, saveWorkflow, appendLog, STATUS } from '../models/VideoWorkflow.js';
import { eventBus } from '../services/eventBus.js';

export function startComposeWorker() {
  return new Worker('compose-queue', async (job) => {
    const { workflowId } = job.data;
    const wf = await findWorkflow(workflowId);
    try {
      const out = await composeFinal(wf);
      wf.compose = out;
      wf.status = STATUS.COMPLETED;
      appendLog(wf, 'info', `✅ 完成：${out.finalVideoUrl}`);
      await saveWorkflow(wf);
      eventBus.emitProgress(workflowId, { stage: 'compose', status: 'done', finalVideoUrl: out.finalVideoUrl, coverUrl: out.coverUrl });
    } catch (err) {
      wf.status = STATUS.FAILED;
      appendLog(wf, 'error', `合成失败：${err.message}`);
      await saveWorkflow(wf);
      eventBus.emitProgress(workflowId, { stage: 'compose', status: 'failed', error: err.message });
      throw err;
    }
  }, { connection: redisConnection, concurrency: 1 });
}
