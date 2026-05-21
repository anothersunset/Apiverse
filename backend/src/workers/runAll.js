import 'dotenv/config';
import { initStore } from '../models/VideoWorkflow.js';
import { startScriptWorker } from './scriptWorker.js';
import { startCharacterWorker } from './characterWorker.js';
import { startShotWorker } from './shotWorker.js';
import { startVoiceWorker } from './voiceWorker.js';
import { startComposeWorker } from './composeWorker.js';

await initStore();
startScriptWorker();
startCharacterWorker();
startShotWorker();
startVoiceWorker();
startComposeWorker();
console.log('[workers] all workers started');

export function startAllWorkers() {
  startScriptWorker();
  startCharacterWorker();
  startShotWorker();
  startVoiceWorker();
  startComposeWorker();
}
