import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'node:path';

import { STORAGE_ROOT } from './config/storage.js';
import { initStore } from './models/VideoWorkflow.js';
import videoWorkflowRoutes from './routes/videoWorkflowRoutes.js';
import { startScriptWorker } from './workers/scriptWorker.js';
import { startCharacterWorker } from './workers/characterWorker.js';
import { startShotWorker } from './workers/shotWorker.js';
import { startVoiceWorker } from './workers/voiceWorker.js';
import { startComposeWorker } from './workers/composeWorker.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ============ 中间件 ============
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use('/api/', apiLimiter);

// ============ 静态资源（生成的视频 / 图片 / 音频）============
app.use('/static', express.static(STORAGE_ROOT, { maxAge: '7d', fallthrough: true }));

// ============ 老版本 API聚合路由 (保留) ============
// 这些是原有 APIVerse 聊天助手/API 集成功能的本地 mock。
const apis = [
  { id: 1,  name: 'OpenWeather API', category: 'weather',     icon: '⛅️', desc: '全球天气数据查询', endpoint: 'https://api.openweathermap.org/data/2.5/weather', method: 'GET', pricing: 'free', popularity: 95, tags: ['weather', 'forecast'] },
  { id: 2,  name: 'GitHub API',      category: 'developer',   icon: '🐙', desc: '代码仓库与开发者数据', endpoint: 'https://api.github.com', method: 'GET', pricing: 'free', popularity: 98, tags: ['code', 'git'] },
  { id: 3,  name: 'Stripe API',      category: 'payment',     icon: '💳', desc: '全球支付解决方案',  endpoint: 'https://api.stripe.com/v1', method: 'POST', pricing: 'paid', popularity: 92, tags: ['payment'] },
  { id: 4,  name: 'Twilio API',      category: 'communication', icon: '📞', desc: '短信/语音/视频通信', endpoint: 'https://api.twilio.com', method: 'POST', pricing: 'paid', popularity: 88, tags: ['sms', 'voice'] },
  { id: 5,  name: 'Spotify API',     category: 'media',       icon: '🎵', desc: '音乐数据与播放',     endpoint: 'https://api.spotify.com/v1', method: 'GET', pricing: 'free', popularity: 85, tags: ['music'] },
  { id: 6,  name: 'NASA API',        category: 'science',     icon: '🚀', desc: '太空探索数据',          endpoint: 'https://api.nasa.gov', method: 'GET', pricing: 'free', popularity: 78, tags: ['space'] },
  { id: 7,  name: 'Unsplash API',    category: 'media',       icon: '📸', desc: '高质量免费图片',       endpoint: 'https://api.unsplash.com', method: 'GET', pricing: 'free', popularity: 90, tags: ['images'] },
  { id: 8,  name: 'OpenAI API',      category: 'ai',          icon: '🤖', desc: 'GPT/DALL-E 等 AI 能力', endpoint: 'https://api.openai.com/v1', method: 'POST', pricing: 'paid', popularity: 99, tags: ['ai', 'gpt'] },
  { id: 9,  name: 'Google Maps API', category: 'maps',        icon: '🗺️', desc: '地图与位置服务',     endpoint: 'https://maps.googleapis.com/maps/api', method: 'GET', pricing: 'paid', popularity: 94, tags: ['maps'] },
  { id: 10, name: 'Currency API',    category: 'finance',     icon: '💱', desc: '实时汇率转换',           endpoint: 'https://api.exchangerate-api.com/v4/latest', method: 'GET', pricing: 'free', popularity: 80, tags: ['currency'] },
];

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/api/apis', (req, res) => {
  const { category, q } = req.query;
  let list = apis;
  if (category) list = list.filter((a) => a.category === category);
  if (q) list = list.filter((a) => (a.name + a.desc + a.tags.join(' ')).toLowerCase().includes(String(q).toLowerCase()));
  res.json({ total: list.length, data: list });
});
app.get('/api/apis/:id', (req, res) => {
  const item = apis.find((a) => a.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'not found' });
  res.json(item);
});
app.get('/api/categories', (req, res) => {
  const cats = [...new Set(apis.map((a) => a.category))];
  res.json({ data: cats });
});
app.get('/api/stats', (req, res) => {
  res.json({
    total: apis.length,
    free: apis.filter((a) => a.pricing === 'free').length,
    paid: apis.filter((a) => a.pricing === 'paid').length,
  });
});

// ============ 老版本 AI 辅助路由 (保留 mock) ============
app.post('/api/ai/recommend', (req, res) => {
  const { need } = req.body || {};
  const n = String(need || '').toLowerCase();
  const matched = apis.filter((a) => (a.name + a.desc + a.tags.join(' ')).toLowerCase().includes(n)).slice(0, 5);
  res.json({ recommendations: matched.length ? matched : apis.slice(0, 3) });
});
app.post('/api/ai/generate-code', (req, res) => {
  const { apiId, language = 'javascript' } = req.body || {};
  const a = apis.find((x) => x.id === Number(apiId));
  if (!a) return res.status(404).json({ error: 'api not found' });
  res.json({
    language,
    code: `// Sample call to ${a.name}\nfetch('${a.endpoint}').then(r => r.json()).then(console.log);`,
  });
});
app.post('/api/ai/diagnose', (req, res) => res.json({ status: 'ok', tips: ['检查 API Key', '检查请求头', '检查限流'] }));

// ============ 新版 AI 视频生成工作流 ============
app.use('/api/video-workflows', videoWorkflowRoutes);

// ============ 老版本视频接口 (保留 - 转发到新接口) ============
// 保留转发以避免现有前端调用中断
app.post('/api/video/generate', async (req, res) => {
  // 转发到新接口
  req.url = '/';
  videoWorkflowRoutes(req, res, () => res.status(404).end());
});

// ============ 错误处理 ============
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ error: err.message || 'internal error' });
});

// ============ 启动 ============
async function bootstrap() {
  await initStore();
  startScriptWorker();
  startCharacterWorker();
  startShotWorker();
  startVoiceWorker();
  startComposeWorker();
  app.listen(PORT, () => {
    console.log(`✨ APIVerse backend on http://localhost:${PORT}`);
    console.log(`   - /api/apis          (API聚合)`);
    console.log(`   - /api/video-workflows (AI视频生成)`);
    console.log(`   - /static             (生成物文件)`);
  });
}

bootstrap().catch((e) => {
  console.error('bootstrap failed:', e);
  process.exit(1);
});
