# 🚀 APIVerse 部署指南

## 本地运行

```bash
# 给启动脚本添加执行权限
chmod +x start.sh

# 启动项目
./start.sh
```

访问 http://localhost:3000 查看前端界面

---

## 部署到 Vercel (前端)

### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```

### 3. 部署前端
```bash
cd frontend
vercel
```

### 4. 配置环境变量
在 Vercel 项目设置中添加：
- `NEXT_PUBLIC_API_URL` = 你的后端API地址

---

## 部署到 Railway (后端)

### 1. 安装 Railway CLI
```bash
npm i -g @railway/cli
```

### 2. 登录 Railway
```bash
railway login
```

### 3. 部署后端
```bash
cd backend
railway init
railway up
```

### 4. 获取部署URL
```bash
railway domain
```

---

## 项目结构

```
apiverse/
├── backend/           # 后端服务
│   ├── src/
│   │   ├── index.js   # 主入口（简化版，无需数据库）
│   │   └── ...
│   └── package.json
├── frontend/          # 前端应用
│   ├── src/
│   │   ├── app/       # Next.js页面
│   │   └── components/
│   └── package.json
├── start.sh           # 启动脚本
└── README.md
```

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/apis` | GET | 获取API列表 |
| `/api/apis/:id` | GET | 获取API详情 |
| `/api/categories` | GET | 获取所有分类 |
| `/api/stats` | GET | 获取统计信息 |
| `/api/ai/recommend` | POST | AI智能推荐 |
| `/api/ai/generate-code` | POST | AI代码生成 |
| `/api/ai/diagnose` | POST | AI错误诊断 |

---

## 技术栈

- **前端**: Next.js 14, React 18, Tailwind CSS
- **后端**: Node.js, Express
- **AI**: 内置智能推荐和代码生成
- **数据**: 内存数据（可扩展至MongoDB）

---

## 简历描述模板

```
APIVerse - 智能API聚合与可视化平台
技术栈：React + Next.js + Node.js + Express
项目时间：2026.03 - 2026.05

【项目描述】
基于public-apis开源数据构建的API聚合平台，集成AI助手帮助开发者快速发现、测试和集成第三方API。

【核心功能】
• 聚合15+类别API，支持分类浏览、智能搜索
• 可视化API调试工作台，支持实时预览
• AI智能推荐引擎，根据项目需求自动推荐合适API
• 一键生成多语言API调用代码（JS/Python/cURL）

【技术亮点】
• 使用Cursor + Claude Code完成90%代码编写
• 实现AI智能推荐算法，基于关键词匹配和分类优化
• 响应式深色主题设计，支持移动端适配

【项目成果】
• GitHub开源项目，完整文档和演示
• 在线演示：https://apiverse.vercel.app
```
