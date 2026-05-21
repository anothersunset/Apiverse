import { queues } from '../queues/index.js';
import { STATUS, findWorkflow, saveWorkflow, appendLog } from '../models/VideoWorkflow.js';
import { eventBus } from './eventBus.js';

export async function startWorkflow(workflowId) {
  const wf = await findWorkflow(workflowId);
  if (!wf) throw new Error(`workflow not found: ${workflowId}`);
  wf.status = STATUS.SCRIPT_RUNNING;
  appendLog(wf, 'info', '🚀 启动工作流');
  await saveWorkflow(wf);
  await queues.script.add('generate-script', { workflowId });
  eventBus.emitProgress(workflowId, { stage: 'script', status: 'running' });
  return wf;
}

export async function onScriptDone(workflowId) {
  const wf = await findWorkflow(workflowId);
  wf.status = STATUS.CHARACTER_RUNNING;
  await saveWorkflow(wf);
  await queues.character.add('generate-characters', { workflowId });
  eventBus.emitProgress(workflowId, { stage: 'character', status: 'running' });
}

export async function onCharacterDone(workflowId) {
  const wf = await findWorkflow(workflowId);
  wf.status = STATUS.SHOTS_RUNNING;
  await saveWorkflow(wf);
  for (const scene of wf.script.scenes) {
    await queues.shot.add('render-shot', { workflowId, sceneId: scene.sceneId });
  }
  await queues.voice.add('generate-voice', { workflowId });
  eventBus.emitProgress(workflowId, {
    stage: 'shots',
    status: 'running',
    total: wf.script.scenes.length,
  });
}

export async function onShotDone(workflowId) {
  const wf = await findWorkflow(workflowId);
  const allDone = wf.script.scenes.every((s) => s.status === 'done');
  const anyRunning = wf.script.scenes.some((s) => s.status === 'running' || s.status === 'pending');
  eventBus.emitProgress(workflowId, {
    stage: 'shots',
    done: wf.script.scenes.filter((s) => s.status === 'done').length,
    total: wf.script.scenes.length,
  });
  if (allDone && wf.voice?.voiceoverUrl) {
    await triggerCompose(workflowId);
  } else if (allDone && !anyRunning) {
    wf.status = STATUS.SHOTS_READY;
    await saveWorkflow(wf);
  }
}

export async function onVoiceDone(workflowId) {
  const wf = await findWorkflow(workflowId);
  wf.status = STATUS.VOICE_READY;
  await saveWorkflow(wf);
  const allShotsDone = wf.script.scenes.every((s) => s.status === 'done');
  if (allShotsDone) await triggerCompose(workflowId);
}

async function triggerCompose(workflowId) {
  const wf = await findWorkflow(workflowId);
  if (wf.status === STATUS.COMPOSING || wf.status === STATUS.COMPLETED) return;
  wf.status = STATUS.COMPOSING;
  appendLog(wf, 'info', '🎬 进入合成阶段');
  await saveWorkflow(wf);
  await queues.compose.add('compose-final', { workflowId });
  eventBus.emitProgress(workflowId, { stage: 'compose', status: 'running' });
}

export async function retryShot(workflowId, sceneId) {
  const wf = await findWorkflow(workflowId);
  const scene = wf.script.scenes.find((s) => s.sceneId === sceneId);
  if (!scene) throw new Error('scene not found');
  scene.status = 'pending';
  scene.errorMsg = null;
  scene.retryCount = (scene.retryCount || 0) + 1;
  if (wf.status === STATUS.FAILED) wf.status = STATUS.SHOTS_RUNNING;
  await saveWorkflow(wf);
  await queues.shot.add('render-shot', { workflowId, sceneId });
}
