import { createWorkflow, findWorkflow, STATUS } from '../models/VideoWorkflow.js';
import { startWorkflow, retryShot } from '../services/workflowOrchestrator.js';
import { eventBus } from '../services/eventBus.js';

export async function createAndStart(req, res) {
  try {
    const { topic, style = 'cinematic', durationSec = 18, aspectRatio = '9:16', sceneCount = 3, providers = {} } = req.body || {};
    if (!topic) return res.status(400).json({ error: 'topic is required' });
    const wf = await createWorkflow({ topic, style, durationSec, aspectRatio, sceneCount, providers });
    await startWorkflow(wf.workflowId);
    res.json({ workflowId: wf.workflowId, status: wf.status });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getStatus(req, res) {
  const wf = await findWorkflow(req.params.id);
  if (!wf) return res.status(404).json({ error: 'not found' });
  res.json({
    workflowId: wf.workflowId,
    status: wf.status,
    script: wf.script,
    characters: wf.characters,
    voice: wf.voice,
    compose: wf.compose,
    logs: (wf.logs || []).slice(-30),
  });
}

export async function streamEvents(req, res) {
  const id = req.params.id;
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();
  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  const wf = await findWorkflow(id);
  if (!wf) { res.status(404).end(); return; }
  send({ stage: 'init', status: wf.status, script: wf.script, characters: wf.characters });
  const unsub = eventBus.onWorkflow(id, send);
  const ping = setInterval(() => res.write(': ping\n\n'), 15000);
  req.on('close', () => { unsub(); clearInterval(ping); });
}

export async function retry(req, res) {
  try {
    await retryShot(req.params.id, req.params.sceneId);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function getFinal(req, res) {
  const wf = await findWorkflow(req.params.id);
  if (!wf) return res.status(404).json({ error: 'not found' });
  if (wf.status !== STATUS.COMPLETED) {
    return res.status(409).json({ error: 'not completed yet', status: wf.status });
  }
  res.json(wf.compose);
}
