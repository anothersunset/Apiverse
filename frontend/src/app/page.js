'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero 区域 */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
            APIVerse
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4">探索无限 API 宇宙</p>
          <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
            发现、测试和集成最优质的 API，构建强大的应用程序
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/apis"
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 rounded-xl text-white font-medium transition-colors"
            >
              🔍 浏览 API
            </Link>
            <Link
              href="/video-tools"
              className="px-8 py-3 bg-secondary-600 hover:bg-secondary-700 rounded-xl text-white font-medium transition-colors"
            >
              🎬 AI视频工具
            </Link>
          </div>
        </div>
      </section>

      {/* 功能特色 */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-800 rounded-xl">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">API 市场</h3>
              <p className="text-gray-400">500+ 精选 API，覆盖各类应用场景</p>
              <Link href="/apis" className="text-primary-400 hover:text-primary-300 mt-4 inline-block">
                浏览 API →
              </Link>
            </div>
            <div className="text-center p-6 bg-gray-800 rounded-xl">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold mb-2">AI 视频工具</h3>
              <p className="text-gray-400">最强 AI 视频生成工具聚合，一键创作</p>
              <Link href="/video-tools" className="text-secondary-400 hover:text-secondary-300 mt-4 inline-block">
                探索工具 →
              </Link>
            </div>
            <div className="text-center p-6 bg-gray-800 rounded-xl">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI 助手</h3>
              <p className="text-gray-400">智能推荐、代码生成、错误诊断</p>
              <Link href="/apis" className="text-accent-400 hover:text-accent-300 mt-4 inline-block">
                体验 AI →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI视频工具亮点 */}
      <section className="py-16 px-4 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">🎬 AI视频生成工具</h2>
          <p className="text-center text-gray-400 mb-12">精选开源工具，从剧本到成片一站式解决</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🔥', name: '火宝短剧', desc: '一句话生成完整短剧' },
              { icon: '🎭', name: '魔影创作者', desc: '专业级AI影视工具' },
              { icon: '🪼', name: 'Jellyfish', desc: '端到端短剧生产' },
              { icon: '🎨', name: 'ComfyUI', desc: '节点式工作流引擎' },
            ].map((tool, idx) => (
              <div key={idx} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors">
                <div className="text-3xl mb-3">{tool.icon}</div>
                <h3 className="font-semibold mb-1">{tool.name}</h3>
                <p className="text-gray-400 text-sm">{tool.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/video-tools"
              className="px-6 py-3 bg-secondary-600 hover:bg-secondary-700 rounded-lg text-white font-medium transition-colors"
            >
              查看全部工具 →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
