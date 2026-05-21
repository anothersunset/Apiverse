import mongoose from 'mongoose';
import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuid } from 'uuid';
import { getWorkflowDir, ensureWorkflowDirs } from '../config/storage.js';

export const STATUS = {
  CREATED: 'created',
  SCRIPT_RUNNING: 'script_running',
  SCRIPT_READY: 'script_ready',
  CHARACTER_RUNNING: 'character_running',
  CHARACTER_READY: 'character_ready',
  SHOTS_RUNNING: 'shots_running',
  SHOTS_READY: 'shots_ready',
  VOICE_RUNNING: 'voice_running',
  VOICE_READY: 'voice_ready',
  COMPOSING: 'composing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELED: 'canceled',
};

const sceneSchema = new mongoose.Schema({
  sceneId: String,
  shotPrompt: String,
  voiceover: String,
  durationSec: { type: Number, default: 6 },
  status: { type: String, default: 'pending' },
  videoUrl: String,
  voiceUrl: String,
  retryCount: { type: Number, default: 0 },
  errorMsg: String,
}, { _id: false });

const characterSchema = new mongoose.Schema({
  characterId: String,
  name: String,
  visualPrompt: String,
  referenceImageUrl: String,
}, { _id: false });

const workflowSchema = new mongoose.Schema({
  workflowId: { type: String, unique: true, default: () => `vw_${uuid().slice(0, 8)}` },
  status: { type: String, default: STATUS.CREATED },
  input: {
    topic: String,
    style: String,
    durationSec: { type: Number, default: 18 },
    aspectRatio: { type: String, default: '9:16' },
    sceneCount: { type: Number, default: 3 },
    providers: { type: Object, default: () => ({}) },
  },
  script: { logline: String, scenes: [sceneSchema] },
  characters: [characterSchema],
  voice: { voiceoverUrl: String, subtitleUrl: String },
  compose: { finalVideoUrl: String, coverUrl: String },
  review: { score: Number, issues: [String] },
  logs: [{ ts: Date, level: String, msg: String }],
}, { timestamps: true });

// ============ 内存兜底（无 MongoDB 时使用）============
class InMemoryStore {
  constructor() { this.map = new Map(); }

  async findOne({ workflowId }) {
    if (this.map.has(workflowId)) return this._wrap(this.map.get(workflowId));
    try {
      const file = path.join(getWorkflowDir(workflowId), 'state.json');
      const data = JSON.parse(await fs.readFile(file, 'utf-8'));
      this.map.set(workflowId, data);
      return this._wrap(data);
    } catch { return null; }
  }

  async create(doc) {
    if (!doc.workflowId) doc.workflowId = `vw_${uuid().slice(0, 8)}`;
    this.map.set(doc.workflowId, doc);
    await this._persist(doc);
    return this._wrap(doc);
  }

  async _persist(doc) {
    await ensureWorkflowDirs(doc.workflowId);
    const file = path.join(getWorkflowDir(doc.workflowId), 'state.json');
    await fs.writeFile(file, JSON.stringify(doc, null, 2));
  }

  _wrap(doc) {
    const self = this;
    return new Proxy(doc, {
      get(t, k) {
        if (k === 'save') return async function () { await self._persist(t); return t; };
        return t[k];
      },
      set(t, k, v) { t[k] = v; return true; },
    });
  }
}

const inMemoryStore = new InMemoryStore();
let MongoModel = null;

export async function initStore() {
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    MongoModel = mongoose.model('VideoWorkflow', workflowSchema);
    console.log('[store] using MongoDB');
  } else {
    console.log('[store] using in-memory + state.json (no MONGODB_URI)');
  }
}

export async function createWorkflow(input) {
  const base = {
    workflowId: `vw_${uuid().slice(0, 8)}`,
    status: STATUS.CREATED,
    input,
    script: { scenes: [] },
    characters: [],
    voice: {},
    compose: {},
    logs: [],
  };
  return MongoModel ? MongoModel.create(base) : inMemoryStore.create(base);
}

export async function findWorkflow(workflowId) {
  return MongoModel ? MongoModel.findOne({ workflowId }) : inMemoryStore.findOne({ workflowId });
}

export async function saveWorkflow(wf) {
  if (MongoModel && wf.save) return wf.save();
  return inMemoryStore._persist(wf);
}

export function appendLog(wf, level, msg) {
  wf.logs = wf.logs || [];
  wf.logs.push({ ts: new Date(), level, msg });
  if (wf.logs.length > 500) wf.logs.splice(0, wf.logs.length - 500);
}
