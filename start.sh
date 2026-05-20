#!/bin/bash
# APIVerse 启动脚本

echo "🚀 启动 APIVerse 项目..."
echo ""

# 启动后端
echo "📦 启动后端服务 (端口 5000)..."
cd /root/projects/apiverse/backend
node src/index.js &
BACKEND_PID=$!

# 等待后端启动
sleep 2

# 启动前端
echo "🎨 启动前端服务 (端口 3000)..."
cd /root/projects/apiverse/frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "═══════════════════════════════════════"
echo "✅ APIVerse 已启动"
echo "═══════════════════════════════════════"
echo "   🌐 前端: http://localhost:3000"
echo "   📊 后端: http://localhost:5000"
echo "   🔗 API: http://localhost:5000/api/health"
echo "═══════════════════════════════════════"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
wait
