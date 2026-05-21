import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { generateCharacter } from '../adapters/character/index.js';
import { findWorkflow, saveWorkflow, appendLog, STATUS } from '../models/VideoWorkflow.js';
import { onCharacterDone } from '../services/workflowOrchestrator.js';
import { eventBus } from '../services/eventBus.js';

export function startCharacterWorker() {
  return new Worker('character-queue', async (job) => {
    const { workflowId } = job.data;
    const wf = await findWorkflow(workflowId);
    try {
      const updated = [];
      for (const c of wf.characters || []) {
        const r = await generateCharacter(c, { workflowId, providers: wf.input.providers });
        updated.push(r);
        eventBus.emitProgress(workflowId, { stage: 'character', characterId: c.characterId, url: r.referenceImageUrl });
      }
      wf.characters = updated;
      wf.status = STATUS.CHARACTER_READY;
      appendLog(wf, 'info', `角色完成：${updated.length}`);
      await saveWorkflow(wf);
      eventBus.emitProgress(workflowId, { stage: 'character', status: 'done' });
      await onCharacterDone(workflowId);
    } catch (err) {
      appendLog(wf, 'error', `角色失败：${err.message}`);
      wf.status = STATUS.FAILED;
      await saveWorkflow(wf);
      eventBus.emitProgress(workflowId, { stage: 'character', status: 'failed', error: err.message });
      throw err;
    }
  }, { connection: redisConnection, concurrency: 2 });
}
