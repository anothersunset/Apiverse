'use client';

import { useState } from 'react';
import Link from 'next/link';

// AI视频工具数据
const videoTools = [
  {
    id: 'toonflow',
    name: 'Toonflow',
    description: 'AI短剧创作工具，将小说、剧本快速转化为动画短剧',
    category: '短剧生成',
    features: ['AI编剧', '智能分镜', '角色生成', '视频生成'],
    language: 'HTML',
    stars: '2.1k',
    github: 'https://github.com/HBAI-Ltd/Toonflow-app',
    icon: '🎬',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'jellyfish',
    name: 'Jellyfish',
    description: 'AI生成短剧的端到端生产工作区，从脚本到成片',
    category: '端到端生产',
    features: ['脚本输入', '故事板', '一致性管理', '镜头准备', '视频生成'],
    language: 'Python',
    stars: '1.8k',
    github: 'https://github.com/Forget-C/Jellyfish',
    icon: '🪼',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'huobao',
    name: '火宝短剧',
    description: '一句话生成完整短剧，从剧本到成片全自动化',
    category: '一键生成',
    features: ['一句话生成', '全自动流程', '多风格支持', '批量生成'],
    language: 'TypeScript',
    stars: '3.2k',
    github: 'https://github.com/chatfire-AI/huobao-drama',
    icon: '🔥',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'moyin',
    name: '魔影创作者',
    description: 'AI影视生产级工具，支持Seedance 2.0，剧本到成片全流程',
    category: '专业制作',
    features: ['Seedance 2.0', '批量生产', '专业级输出', '多模型支持'],
    language: 'TypeScript',
    stars: '2.5k',
    github: 'https://github.com/MemeCalculate/moyin-creator',
    icon: '🎭',
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'comfyui',
    name: 'ComfyUI',
    description: '强大的节点式AI图像/视频生成工作流引擎',
    category: '工作流引擎',
    features: ['节点编辑', '工作流自定义', '模型支持', '批量处理'],
    language: 'Python',
    stars: '45k',
    github: 'https://github.com/comfyanonymous/ComfyUI',
    icon: '🎨',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'animatediff',
    name: 'AnimateDiff',
    description: '将文本转换为动画视频的AI工具',
    category: '文生视频',
    features: ['文本转视频', '风格控制', '运动控制', '高质量输出'],
    language: 'Python',
    stars: '12k',
    github: 'https://github.com/guoyww/AnimateDiff',
    icon: '✨',
    color: 'from-yellow-500 to-amber-500'
  }
];

// 工作流模板
const workflowTemplates = [
  {
    id: 'script-to-video',
    name: '剧本转视频',
    description: '输入剧本文字，自动生成完整视频',
    steps: ['📝 剧本输入', '🎭 分镜拆解', '🖼️ 画面生成', '🎬 视频合成', '🎵 配音配乐', '📦 导出'],
    duration: '约10-30分钟',
    difficulty: '简单'
  },
  {
    id: 'image-to-video',
    name: '图片转视频',
    description: '将静态图片转换为动态视频',
    steps: ['🖼️ 图片输入', '✨ 动画生成', '🎬 视频合成', '📦 导出'],
    duration: '约5-15分钟',
    difficulty: '简单'
  },
  {
    id: 'text-to-animation',
    name: '文字转动画',
    description: '描述场景，生成动画短片',
    steps: ['📝 场景描述', '🎨 风格选择', '🖼️ 画面生成', '🎬 动画制作', '📦 导出'],
    duration: '约15-45分钟',
    difficulty: '中等'
  },
  {
    id: 'full-drama',
    name: '完整短剧生成',
    description: '从故事大纲到完整短剧的全流程',
    steps: ['📝 故事大纲', '🎭 剧本生成', '👥 角色设计', '🎬 分镜脚本', '🖼️ 画面生成', '🎬 视频合成', '🎵 配音配乐', '📦 导出'],
    duration: '约30-60分钟',
    difficulty: '高级'
  }
];

export default function VideoToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const categories = ['all', '短剧生成', '端到端生产', '一键生成', '专业制作', '工作流引擎', '文生视频'];

  const filteredTools = selectedCategory === 'all' 
    ? videoTools 
    : videoTools.filter(tool => tool.category === selectedCategory);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎬 AI视频工具聚合
          </h1>
          <p className="text-gray-400 text-lg">
            发现最强大的AI视频生成工具，一键创建专业级视频内容
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl font-bold text-primary-400">{videoTools.length}</div>
            <div className="text-gray-400 text-sm">精选工具</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl font-bold text-secondary-400">{workflowTemplates.length}</div>
            <div className="text-gray-400 text-sm">工作流模板</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl font-bold text-accent-400">6</div>
            <div className="text-gray-400 text-sm">工具分类</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">免费</div>
            <div className="text-gray-400 text-sm">开源工具</div>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>

        {/* 工具卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-gray-800 rounded-xl border border-gray-700 hover:border-primary-500 transition-all duration-300 overflow-hidden group"
            >
              {/* 卡片头部 */}
              <div className={`h-2 bg-gradient-to-r ${tool.color}`} />
              
              <div className="p-6">
                {/* 图标和名称 */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl mb-2">{tool.icon}</div>
                    <h3 className="text-xl font-semibold text-white">{tool.name}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">
                      {tool.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 text-sm">⭐ {tool.stars}</div>
                    <div className="text-gray-500 text-xs">{tool.language}</div>
                  </div>
                </div>

                {/* 描述 */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {tool.description}
                </p>

                {/* 特性标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tool.features.slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300"
                    >
                      {feature}
                    </span>
                  ))}
                  {tool.features.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-400">
                      +{tool.features.length - 3}
                    </span>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <a
                    href={tool.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-center text-sm text-white transition-colors"
                  >
                    GitHub
                  </a>
                  <Link
                    href={`/video-tools/${tool.id}`}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-center text-sm text-white transition-colors"
                  >
                    详情
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 工作流模板 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">🔄 工作流模板</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflowTemplates.map((workflow) => (
              <div
                key={workflow.id}
                className={`bg-gray-800 rounded-xl border p-6 cursor-pointer transition-all ${
                  selectedWorkflow === workflow.id
                    ? 'border-primary-500 bg-gray-750'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedWorkflow(workflow.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                    <p className="text-gray-400 text-sm">{workflow.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{workflow.duration}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      workflow.difficulty === '简单' ? 'bg-green-900 text-green-300' :
                      workflow.difficulty === '中等' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {workflow.difficulty}
                    </div>
                  </div>
                </div>

                {/* 工作流步骤 */}
                <div className="flex flex-wrap gap-2">
                  {workflow.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className="text-sm text-gray-300">{step}</span>
                      {idx < workflow.steps.length - 1 && (
                        <span className="mx-2 text-gray-600">→</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* 使用按钮 */}
                <button
                  className="mt-4 w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white text-sm transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/video-tools/workflow?template=${workflow.id}`;
                  }}
                >
                  使用此模板
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 快速开始 */}
        <div className="bg-gradient-to-r from-primary-900/50 to-secondary-900/50 rounded-xl p-8 border border-primary-700">
          <h2 className="text-2xl font-bold text-white mb-4">🚀 快速开始</h2>
          <p className="text-gray-300 mb-6">
            选择一个工作流模板，或从零开始创建你的AI视频生成流程
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/video-tools/workflow"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-medium transition-colors"
            >
              打开工作流编辑器
            </Link>
            <Link
              href="/video-tools/tutorial"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
            >
              查看教程
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
