import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { generateScript } from '../adapters/script/index.js';
import { findWorkflow, saveWorkflow, appendLog, STATUS } from '../models/VideoWorkflow.js';
import { onScriptDone } from '../services/workflowOrchestrator.js';
import { eventBus } from '../services/eventBus.js';

export function startScriptWorker() {
  const worker = new Worker('script-queue', async (job) => {
    const { workflowId } = job.data;
    const wf = await findWorkflow(workflowId);
    try {
      const result = await generateScript(wf.input);
      wf.script = { logline: result.logline, scenes: result.scenes };
      wf.characters = result.characters || [];
      wf.status = STATUS.SCRIPT_READY;
      appendLog(wf, 'info', `脚本完成：${wf.script.scenes.length} 个镜头`);
      await saveWorkflow(wf);
      eventBus.emitProgress(workflowId, { stage: 'script', status: 'done', logline: result.logline });
      await onScriptDone(workflowId);
    } catch (err) {
      appendLog(wf, 'error', `脚本失败：${err.message}`);
      wf.status = STATUS.FAILED;
      await saveWorkflow(wf);
      eventBus.emitProgress(workflowId, { stage: 'script', status: 'failed', error: err.message });
      throw err;
    }
  }, { connection: redisConnection, concurrency: 4 });

  worker.on('failed', (job, err) => console.error('[script] failed', job?.id, err.message));
  return worker;
}
