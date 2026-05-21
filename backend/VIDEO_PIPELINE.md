# APIVerse 视频生成流水线

从 **主题 → 脚本 → 角色 → 镜头 → 配音 → 合成 → 成品视频** 的完整闭环。

## 1. 快速起动（0 API key 验证）

```bash
cd backend
cp .env.example .env
npm install
redis-server &        # 任意方式启一个本地 Redis
npm run dev            # 服务启动 + worker 同进程
```

默认所有 provider = `mock`，生成出来的是 “镜头色块 + 文字 + 低频音频”，**但是一个真的 mp4**，能验证全链路。

## 2. 创建一个工作流

```bash
curl -X POST http://localhost:5000/api/video-workflows \
  -H 'content-type: application/json' \
  -d '{"topic":"一只狐狸探险 API 世界","sceneCount":3,"durationSec":15,"style":"cinematic"}'
# => {"workflowId":"vw_xxx","status":"script_running"}
```

## 3. 实时进度 (SSE)

```bash
curl -N http://localhost:5000/api/video-workflows/vw_xxx/events
```

## 4. 查询状态

```bash
curl http://localhost:5000/api/video-workflows/vw_xxx
```

## 5. 获取最终视频

```bash
curl http://localhost:5000/api/video-workflows/vw_xxx/final
# => {"finalVideoUrl":"http://localhost:5000/static/workflows/vw_xxx/final.mp4", "coverUrl":".../cover.png"}
```

## 6. 切换到真实 Provider

编辑 `.env`：

```bash
SCRIPT_PROVIDER=openai
VIDEO_PROVIDER=kling
VOICE_PROVIDER=elevenlabs
CHARACTER_PROVIDER=flux
OPENAI_API_KEY=sk-...
KLING_ACCESS_KEY=...
KLING_SECRET_KEY=...
ELEVENLABS_API_KEY=...
FAL_KEY=...
```

## 7. 状态机

```
created → script_running → script_ready → character_running → character_ready
  → shots_running → shots_ready (并行) + voice_running → voice_ready
  → composing → completed | failed | canceled
```

## 8. 重试单个镜头

```bash
curl -X POST http://localhost:5000/api/video-workflows/vw_xxx/retry/s2
```

## 9. 生成物布局

```
storage/workflows/vw_xxx/
  state.json        # 内存备份（无 Mongo 时）
  chars/c_xx.svg|png
  shots/s1.mp4 s2.mp4 ...
  voice/voiceover.mp3
  tmp/concat.txt concat.mp4
  cover.png
  final.mp4         ← 最终产物
```

## 10. 部署

* 单进程验证：`npm run dev` 即可（服务 + worker 同进程）
* 生产：推荐拆分 `npm start` (API) + `npm run workers` (Worker)
* 无 Mongo 运行：留空 `MONGODB_URI`，状态写入 `state.json`
* 无 Redis：本项目必须有 Redis（BullMQ 依赖）。本地推荐用 Docker：`docker run -d -p 6379:6379 redis:7-alpine`
