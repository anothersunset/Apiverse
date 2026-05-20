/**
 * APIVerse 后端服务入口（简化版 - 内存数据模式）
 * 无需MongoDB，使用内存数据存储
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// 创建 Express 应用实例
const app = express();
const PORT = process.env.PORT || 5000;

// 中间件配置
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

// ============ 内存数据 ============
const apis = [
  { id: 1, name: "OpenWeatherMap", description: "天气数据API，提供全球天气预报、历史天气、空气质量等数据", category: "Weather", auth: "apiKey", https: true, cors: "yes", url: "https://api.openweathermap.org/data/2.5/" },
  { id: 2, name: "NewsAPI", description: "新闻聚合API，提供全球新闻源、文章搜索和头条新闻", category: "News", auth: "apiKey", https: true, cors: "unknown", url: "https://newsapi.org/v2/" },
  { id: 3, name: "CoinGecko", description: "加密货币API，提供价格、市值、交易量等数据", category: "Finance", auth: "No", https: true, cors: "yes", url: "https://api.coingecko.com/api/v3/" },
  { id: 4, name: "Google Maps", description: "地图服务API，提供地理编码、路线规划、地点搜索等功能", category: "Geocoding", auth: "apiKey", https: true, cors: "unknown", url: "https://maps.googleapis.com/maps/api/" },
  { id: 5, name: "Spotify", description: "音乐流媒体API，提供歌曲搜索、播放列表、用户数据等功能", category: "Music", auth: "OAuth", https: true, cors: "unknown", url: "https://api.spotify.com/v1/" },
  { id: 6, name: "OpenAI", description: "AI模型API，提供GPT、DALL-E、Whisper等AI能力", category: "Machine Learning", auth: "apiKey", https: true, cors: "yes", url: "https://api.openai.com/v1/" },
  { id: 7, name: "GitHub", description: "代码托管平台API，提供仓库、Issue、PR等管理功能", category: "Development", auth: "OAuth", https: true, cors: "yes", url: "https://api.github.com/" },
  { id: 8, name: "Stripe", description: "支付处理API，提供支付、退款、订阅等支付功能", category: "Finance", auth: "apiKey", https: true, cors: "no", url: "https://api.stripe.com/v1/" },
  { id: 9, name: "Twilio", description: "通信API，提供短信、语音、视频通话等功能", category: "Communication", auth: "apiKey", https: true, cors: "unknown", url: "https://api.twilio.com/2010-04-01/" },
  { id: 10, name: "Unsplash", description: "图片API，提供高质量免费图片搜索和下载", category: "Photography", auth: "OAuth", https: true, cors: "yes", url: "https://api.unsplash.com/" },
  { id: 11, name: "Translate", description: "翻译API，支持100+语言的文本翻译", category: "Translation", auth: "apiKey", https: true, cors: "unknown", url: "https://translation.googleapis.com/language/translate/v2/" },
  { id: 12, name: "JokeAPI", description: "笑话API，提供各种类型的笑话和段子", category: "Entertainment", auth: "No", https: true, cors: "yes", url: "https://v2.jokeapi.dev/" },
  { id: 13, name: "Cat Facts", description: "猫咪事实API，随机提供有趣的猫咪知识", category: "Animals", auth: "No", https: true, cors: "unknown", url: "https://catfact.ninja/" },
  { id: 14, name: "JSONPlaceholder", description: "虚拟REST API，用于测试和原型开发", category: "Development", auth: "No", https: true, cors: "unknown", url: "https://jsonplaceholder.typicode.com/" },
  { id: 15, name: "IP Geolocation", description: "IP定位API，根据IP地址获取地理位置信息", category: "Geocoding", auth: "apiKey", https: true, cors: "yes", url: "https://ipapi.co/" },
];

// ============ 路由配置 ============

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'APIVerse 服务运行正常', timestamp: new Date().toISOString() });
});

// 获取API列表（支持搜索、分类筛选、分页）
app.get('/api/apis', (req, res) => {
  let { search, category, page = 1, limit = 20 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  let filtered = [...apis];

  // 搜索筛选
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(api =>
      api.name.toLowerCase().includes(searchLower) ||
      api.description.toLowerCase().includes(searchLower) ||
      api.category.toLowerCase().includes(searchLower)
    );
  }

  // 分类筛选
  if (category) {
    filtered = filtered.filter(api => api.category.toLowerCase() === category.toLowerCase());
  }

  // 分页
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  res.json({
    success: true,
    data: paginated,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

// 获取单个API详情
app.get('/api/apis/:id', (req, res) => {
  const api = apis.find(a => a.id === parseInt(req.params.id));
  if (!api) return res.status(404).json({ error: 'API不存在' });
  res.json({ success: true, data: api });
});

// 获取所有分类
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(apis.map(api => api.category))];
  const categoryCounts = categories.map(cat => ({
    name: cat,
    count: apis.filter(api => api.category === cat).length
  }));
  res.json({ success: true, data: categoryCounts });
});

// 获取统计信息
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalApis: apis.length,
      totalCategories: [...new Set(apis.map(api => api.category))].length,
      httpsEnabled: apis.filter(api => api.https).length,
      noAuth: apis.filter(api => api.auth === 'No').length
    }
  });
});

// ============ AI 路由 ============

// AI智能推荐
app.post('/api/ai/recommend', (req, res) => {
  const { need } = req.body;
  if (!need) return res.status(400).json({ error: '请提供需求描述' });

  const keywords = need.toLowerCase().split(/[\s,，.。!！?？、]+/).filter(w => w.length > 1);
  const scored = apis.map(api => {
    let score = 0;
    const searchText = `${api.name} ${api.description} ${api.category}`.toLowerCase();
    keywords.forEach(keyword => { if (searchText.includes(keyword)) score += 10; });
    return { ...api, score };
  });

  const recommendations = scored.filter(api => api.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
  res.json({ success: true, need, recommendations });
});

// AI代码生成
app.post('/api/ai/generate-code', (req, res) => {
  const { apiInfo, language = 'javascript' } = req.body;
  if (!apiInfo) return res.status(400).json({ error: '请提供API信息' });

  const hasAuth = apiInfo.auth && apiInfo.auth !== 'No';
  let code = '';

  if (language === 'javascript') {
    code = `// ${apiInfo.name} - JavaScript调用示例
const response = await fetch('${apiInfo.url || 'https://api.example.com'}', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    ${hasAuth ? `'Authorization': 'Bearer YOUR_API_KEY',` : ''}
  },
});
const data = await response.json();
console.log(data);`;
  } else if (language === 'python') {
    code = `# ${apiInfo.name} - Python调用示例
import requests
response = requests.get(
    "${apiInfo.url || 'https://api.example.com'}",
    headers={"Content-Type": "application/json"${hasAuth ? ', "Authorization": "Bearer YOUR_API_KEY"' : ''}}
)
data = response.json()
print(data)`;
  } else {
    code = `# ${apiInfo.name} - cURL调用示例
curl -X GET "${apiInfo.url || 'https://api.example.com'}" \\
  -H "Content-Type: application/json"${hasAuth ? ' \\\n  -H "Authorization: Bearer YOUR_API_KEY"' : ''}`;
  }

  res.json({ success: true, language, code });
});

// AI错误诊断
app.post('/api/ai/diagnose', (req, res) => {
  const { errorMessage } = req.body;
  const diagnosis = {
    problem: '未知错误',
    solution: '请检查网络连接和API配置',
    docs: '查看API文档获取帮助'
  };

  const statusCode = errorMessage?.match(/(\d{3})/)?.[1];
  const errorMap = {
    '401': { problem: '认证失败', solution: '请检查API Key是否正确' },
    '403': { problem: '权限不足', solution: '检查API Key权限范围' },
    '404': { problem: '资源不存在', solution: '检查API端点URL是否正确' },
    '429': { problem: '请求过于频繁', solution: '降低请求频率或申请更高配额' },
    '500': { problem: '服务器内部错误', solution: '稍后重试或联系API提供商' }
  };

  if (statusCode && errorMap[statusCode]) Object.assign(diagnosis, errorMap[statusCode]);
  res.json({ success: true, diagnosis });
});

// ============ 视频生成路由 (短剧系统) ============

// 视频任务存储 (内存)
const videoTasks = [];
let taskIdCounter = 1;

// 创建视频生成任务
app.post('/api/video/generate', (req, res) => {
  const { idea, mode = 'local', duration = 60 } = req.body;
  if (!idea) return res.status(400).json({ error: '请提供短剧创意描述' });

  const taskId = `task_${taskIdCounter++}_${Date.now()}`;
  const task = {
    id: taskId,
    idea,
    mode,
    duration,
    status: 'queued',
    progress: 0,
    steps: ['story_generation', 'character_design', 'shot_breakdown', 'frame_rendering', 'voice_generation', 'video_composition', 'quality_check'],
    currentStep: 'story_generation',
    result: null,
    createdAt: new Date().toISOString(),
  };
  videoTasks.push(task);

  // 模拟异步处理
  setTimeout(() => {
    task.status = 'completed';
    task.progress = 100;
    task.currentStep = 'quality_check';
    task.result = {
      final_video: 'output/final_short_drama.mp4',
      story: { title: idea.slice(0, 20), theme: idea },
      shots_count: 5,
      duration_seconds: duration,
      report: 'output/report.md',
    };
  }, 30000);

  res.json({ success: true, task });
});

// 查询任务状态
app.get('/api/video/tasks/:taskId', (req, res) => {
  const task = videoTasks.find(t => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: '任务不存在' });
  res.json({ success: true, task });
});

// 获取所有任务列表
app.get('/api/video/tasks', (req, res) => {
  res.json({ success: true, tasks: videoTasks, total: videoTasks.length });
});

// 导出视频
app.get('/api/video/export/:taskId', (req, res) => {
  const task = videoTasks.find(t => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: '任务不存在' });
  if (task.status !== 'completed') return res.status(400).json({ error: '任务尚未完成' });

  res.json({
    success: true,
    download_url: `/api/video/download/${task.id}`,
    format: 'mp4',
    task: { id: task.id, result: task.result },
  });
});

// 获取AI视频工具列表
app.get('/api/video/tools', (req, res) => {
  const tools = [
    { id: 'toonflow', name: 'Toonflow', category: '项目编排', description: '剧本→分镜→镜头任务的产品流程', stage: '剧情拆解、分镜结构' },
    { id: 'jellyfish', name: 'Jellyfish', category: '资产管理', description: '管理角色、场景、镜头和素材状态', stage: '资产管理与角色一致性' },
    { id: 'huobao', name: '火宝短剧', category: '自动生成', description: '一句话生成完整短剧的主模板', stage: '一键生成与自动编排' },
    { id: 'moying', name: '魔影创作者', category: '专业生产', description: '专业级批量生产，支持 Seedance 和多模型', stage: '批量镜头与专业风格' },
    { id: 'comfyui', name: 'ComfyUI', category: '本地生成', description: '真实本地生成核心：角色图、首帧图、图生视频', stage: '图像生成与补镜' },
    { id: 'animatediff', name: 'AnimateDiff', category: '保底方案', description: '本地文生视频/图片动画化，无外部API保底', stage: '短循环动画与动态镜头' },
  ];
  res.json({ success: true, tools });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('\n═══════════════════════════════════════');
  console.log('🚀 APIVerse 后端服务已启动');
  console.log('═══════════════════════════════════════');
  console.log(`   🌐 地址: http://localhost:${PORT}`);
  console.log(`   📊 API:  http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════\n');
});

export default app;
