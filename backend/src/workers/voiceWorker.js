import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { generateVoice } from '../adapters/voice/index.js';
import { findWorkflow, saveWorkflow, appendLog } from '../models/VideoWorkflow.js';
import { onVoiceDone } from '../services/workflowOrchestrator.js';
import { eventBus } from '../services/eventBus.js';

export function startVoiceWorker() {
  return new Worker('voice-queue', async (job) => {
    const { workflowId } = job.data;
    const wf = await findWorkflow(workflowId);
    try {
      const text = wf.script.scenes.map((s) => s.voiceover).filter(Boolean).join('\n\n');
      const r = await generateVoice(text, { workflowId, providers: wf.input.providers });
      wf.voice = { ...wf.voice, voiceoverUrl: r.voiceoverUrl };
      appendLog(wf, 'info', '配音完成');
      await saveWorkflow(wf);
      eventBus.emitProgress(workflowId, { stage: 'voice', status: 'done', url: r.voiceoverUrl });
      await onVoiceDone(workflowId);
    } catch (err) {
      appendLog(wf, 'error', `配音失败：${err.message}`);
      await saveWorkflow(wf);
      eventBus.emitProgress(workflowId, { stage: 'voice', status: 'failed', error: err.message });
      throw err;
    }
  }, { connection: redisConnection, concurrency: Number(process.env.VOICE_CONCURRENCY || 3) });
}
