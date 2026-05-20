# APIVerse — 智能 API 聚合与可视化平台

## 项目概述

APIVerse 是一个面向开发者的 **API 发现与集成中心**。聚合数百个公开 API（基于 public-apis 数据集），提供浏览、搜索、可视化调试、AI 推荐、代码生成和错误诊断功能。同时内置 **AI 视频工具专区**，收录开源 AI 视频生成工具及其工作流编辑器。

> 项目于 2026 年 3-5 月开发，90% 代码由 Cursor + Claude Code 生成。

---

## 技术栈

| 分层 | 技术 |
|------|------|
| **前端** | React 18、Next.js 14 (App Router)、Tailwind CSS 3、Framer Motion |
| **后端** | Node.js、Express 4 (ES Modules) |
| **数据库** | MongoDB via Mongoose 7（可选，支持纯内存模式运行） |
| **AI** | 基于关键词的本地推荐引擎（可配置 OpenAI API 接入） |
| **部署** | 前端 Vercel、后端 Railway |

### 核心依赖

| 前端 | 后端 |
|------|------|
| axios, framer-motion, next@14, react@18 | express, cors, axios, mongoose, helmet, morgan |
| reactflow@11（可视化工作流编辑器）| express-rate-limit（限流） |
| recharts@2（数据图表）| openai（可选 LLM 接入） |
| react-syntax-highlighter（代码高亮）| dotenv（环境变量） |

---

## 项目结构

```
apiverse/
├── start.sh                    # 一键启动脚本（后端 :5000 + 前端 :3000）
├── README.md
├── DEPLOYMENT.md
│
├── backend/                    # Express API 服务器
│   └── src/
│       ├── index.js            # 主入口（内存模式单体服务器）
│       ├── config/db.js        # MongoDB 连接配置
│       ├── models/Api.js       # Mongoose Schema
│       ├── controllers/        # apiController + aiController
│       ├── routes/             # apiRoutes + aiRoutes
│       ├── services/           # apiService + aiService
│       ├── middleware/          # errorHandler（统一错误处理）
│       └── scripts/fetchApis.js # GitHub 数据抓取脚本
│
└── frontend/                   # Next.js 14 应用
    └── src/
        ├── app/
        │   ├── layout.js       # 根布局（暗色主题）
        │   ├── page.js         # 首页（Hero、功能卡片、视频工具展示）
        │   ├── apis/           # API 市场页（搜索、分类筛选、分页网格）
        │   ├── video-tools/    # AI 视频工具专区
        │   ├── video-tools/workflow/ # ReactFlow 可视化工作流编辑器
        │   └── api/            # Next.js API Routes（BFF 层）
        ├── components/         # Header、Footer、ApiCard、SearchBar、CategoryTags
        └── services/api.js     # Axios 客户端封装
```

---

## 核心功能

### 1. API 市场
- 浏览 500+ 公开 API（内置 15 个示例 API 用于离线开发）
- 按名称、描述、分类搜索
- 分类侧边栏筛选
- 分页卡片网格，展示认证方式（API Key / OAuth / Bearer / None）、HTTPS/CORS 徽章

### 2. API 详情页（3 个标签页）
- **Info 标签**：端点列表、请求/响应示例
- **Playground 标签**：可视化 HTTP 调试器（方法选择、URL 输入、Headers/Body 编辑、发送、响应查看）
- **代码生成标签**：生成 JavaScript（Fetch）、Python（Requests）、cURL 调用代码

### 3. AI 助手（关键词驱动，无需真实 LLM）
- **智能推荐**：输入自然语言需求描述，提取关键词，评分匹配返回 Top 5 API
- **代码生成**：基于模板生成 JS/Python/cURL 代码片段
- **错误诊断**：根据 HTTP 状态码返回问题描述与解决方案

### 4. AI 视频工具专区
- 收录 6 个开源 AI 视频工具（Toonflow、Jellyfish、火爆短剧、魔音创作者、ComfyUI、AnimateDiff）
- 分类筛选、GitHub Star 数、功能标签
- 4 种工作流模板（剧本到视频、图片到视频、文本到动画、完整短剧）

### 5. 可视化工作流编辑器
- 基于 ReactFlow 的节点式图编辑器
- 节点类型：文本输入、图片输入、音频输入、AI 剧本生成、角色设计、风格迁移、动画、语音合成、音乐生成、视频导出
- 拖拽添加节点、动画连线、缩略图、控制栏
- 模拟执行（逐节点高亮 + 执行日志）、属性面板

---

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/apis` | API 列表（支持 search/category/auth/https/cors/page/limit/sort） |
| GET | `/api/apis/:id` | 获取单个 API 详情 |
| GET | `/api/categories` | 分类列表（含计数） |
| GET | `/api/stats` | 聚合统计 |
| POST | `/api/ai/recommend` | AI 推荐 |
| POST | `/api/ai/generate-code` | 生成代码 |
| POST | `/api/ai/diagnose` | 错误诊断 |

---

## 如何运行

```bash
# 后端（端口 5000）
cd backend && npm install && npm run dev

# 前端（端口 3000）
cd frontend && npm install && npm run dev

# 或一键启动
chmod +x start.sh && ./start.sh
```

数据抓取（如需 MongoDB）：
```bash
cd backend && npm run fetch-apis
```

---

## 架构亮点

1. **双模后端**：内存模式（`index.js` 内置 15 条 API，零依赖即可运行）与 MongoDB 模式（完整的 Model/Service/Controller/Router 分层）
2. **BFF 模式**：Next.js 内部 API Routes 作为 BFF 层，Express 不可用时自动降级为前端内置数据
3. **关键词 AI**：AI 功能无需真实 LLM API Key，所有推荐/诊断均本地计算，同时预留 OpenAI 接入点
4. **暗色主题优先**：全站暗色风格 + 玻璃效果导航栏 + 渐变边框卡片 + Framer Motion 动画
5. **完整的数据管线**：`fetchApis.js` 脚本实现 GitHub Markdown 抓取 → 表格解析 → 字段规范化 → MongoDB 批量写入
