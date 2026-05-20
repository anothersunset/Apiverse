'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// 自定义节点样式
const nodeStyles = {
  input: {
    background: '#1e40af',
    color: 'white',
    border: '2px solid #3b82f6',
    borderRadius: '12px',
    padding: '10px 15px',
    fontSize: '14px',
  },
  process: {
    background: '#7c3aed',
    color: 'white',
    border: '2px solid #8b5cf6',
    borderRadius: '12px',
    padding: '10px 15px',
    fontSize: '14px',
  },
  output: {
    background: '#059669',
    color: 'white',
    border: '2px solid #10b981',
    borderRadius: '12px',
    padding: '10px 15px',
    fontSize: '14px',
  },
  parallel: {
    background: '#d97706',
    color: 'white',
    border: '2px solid #f59e0b',
    borderRadius: '12px',
    padding: '10px 15px',
    fontSize: '14px',
  },
};

// 初始节点
const initialNodes = [
  {
    id: '1',
    type: 'input',
    position: { x: 50, y: 200 },
    data: { label: '📝 剧本输入', description: '输入故事剧本或文字描述' },
    style: nodeStyles.input,
  },
  {
    id: '2',
    position: { x: 250, y: 200 },
    data: { label: '🎭 分镜拆解', description: 'AI自动拆解分镜脚本' },
    style: nodeStyles.process,
  },
  {
    id: '3',
    position: { x: 500, y: 100 },
    data: { label: '🖼️ 画面生成', description: '生成每个分镜的画面' },
    style: nodeStyles.process,
  },
  {
    id: '4',
    position: { x: 500, y: 300 },
    data: { label: '🎵 音频生成', description: '生成配音和背景音乐' },
    style: nodeStyles.parallel,
  },
  {
    id: '5',
    position: { x: 750, y: 200 },
    data: { label: '🎬 视频合成', description: '将画面和音频合成视频' },
    style: nodeStyles.process,
  },
  {
    id: '6',
    type: 'output',
    position: { x: 950, y: 200 },
    data: { label: '📦 导出视频', description: '导出最终视频文件' },
    style: nodeStyles.output,
  },
];

// 初始连线
const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: '#60a5fa' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#60a5fa' },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
    style: { stroke: '#a78bfa' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a78bfa' },
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    animated: true,
    style: { stroke: '#fbbf24' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#fbbf24' },
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    animated: true,
    style: { stroke: '#a78bfa' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a78bfa' },
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    animated: true,
    style: { stroke: '#fbbf24' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#fbbf24' },
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    animated: true,
    style: { stroke: '#34d399' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#34d399' },
  },
];

// 可用节点库
const nodeLibrary = [
  { type: 'input', label: '📝 文本输入', category: '输入' },
  { type: 'input', label: '🖼️ 图片输入', category: '输入' },
  { type: 'input', label: '🎵 音频输入', category: '输入' },
  { type: 'process', label: '🤖 AI剧本生成', category: 'AI处理' },
  { type: 'process', label: '🎭 角色设计', category: 'AI处理' },
  { type: 'process', label: '🎨 风格转换', category: 'AI处理' },
  { type: 'process', label: '✨ 动画生成', category: 'AI处理' },
  { type: 'parallel', label: '🗣️ 语音合成', category: '音频' },
  { type: 'parallel', label: '🎵 音乐生成', category: '音频' },
  { type: 'output', label: '📦 视频导出', category: '输出' },
];

export default function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showLibrary, setShowLibrary] = useState(true);

  // 连接节点
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#60a5fa' },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // 节点点击
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  // 添加节点
  const addNode = useCallback(
    (nodeType) => {
      const newNode = {
        id: `node-${Date.now()}`,
        position: { x: 200 + Math.random() * 300, y: 100 + Math.random() * 200 },
        data: { label: nodeType.label, description: '自定义节点' },
        style: nodeStyles[nodeType.type] || nodeStyles.process,
      };
      setNodes((nds) => [...nds, newNode]);
      addLog(`添加节点: ${nodeType.label}`);
    },
    [setNodes]
  );

  // 删除选中节点
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
      addLog(`删除节点: ${selectedNode.data.label}`);
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  // 添加日志
  const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-50), { time, message }]);
  };

  // 模拟运行
  const runWorkflow = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog('🚀 开始执行工作流...');

    for (const node of nodes) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, style: { ...n.style, border: '3px solid #fbbf24', boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)' } }
            : n
        )
      );
      addLog(`⏳ 正在处理: ${node.data.label}`);
      await new Promise((r) => setTimeout(r, 1200));

      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, style: { ...n.style, border: '3px solid #10b981', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' } }
            : n
        )
      );
      addLog(`✅ 完成: ${node.data.label}`);
    }

    addLog('🎉 工作流执行完成！');
    setIsRunning(false);
  };

  // 重置
  const resetWorkflow = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setLogs([]);
    setSelectedNode(null);
    addLog('🔄 工作流已重置');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 顶部工具栏 */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/video-tools" className="text-gray-400 hover:text-white">
            ← 返回
          </Link>
          <h1 className="text-lg font-semibold">🎬 AI视频工作流编辑器</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetWorkflow}
            disabled={isRunning}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm disabled:opacity-50"
          >
            🔄 重置
          </button>
          <button
            onClick={runWorkflow}
            disabled={isRunning}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm disabled:opacity-50"
          >
            {isRunning ? '⏳ 运行中...' : '▶️ 运行工作流'}
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-57px)]">
        {/* 左侧节点库 */}
        {showLibrary && (
          <div className="w-56 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">节点库</h2>
              <button onClick={() => setShowLibrary(false)} className="text-gray-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            {['输入', 'AI处理', '音频', '输出'].map((category) => (
              <div key={category} className="mb-4">
                <h3 className="text-xs text-gray-400 uppercase mb-2">{category}</h3>
                <div className="space-y-1">
                  {nodeLibrary
                    .filter((n) => n.category === category)
                    .map((node, idx) => (
                      <button
                        key={idx}
                        onClick={() => addNode(node)}
                        className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                      >
                        {node.label}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 中间画布 */}
        <div className="flex-1">
          {!showLibrary && (
            <button
              onClick={() => setShowLibrary(true)}
              className="absolute top-16 left-4 z-10 px-3 py-1 bg-gray-700 rounded text-sm"
            >
              ☰ 节点库
            </button>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            style={{ background: '#111827' }}
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'input') return '#3b82f6';
                if (node.type === 'output') return '#10b981';
                return '#8b5cf6';
              }}
            />
            <Background color="#374151" gap={20} />
          </ReactFlow>
        </div>

        {/* 右侧属性面板 */}
        <div className="w-64 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4 text-sm">属性面板</h2>

          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400">节点名称</label>
                <div className="mt-1 p-2 bg-gray-700 rounded text-sm">
                  {selectedNode.data.label}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400">描述</label>
                <div className="mt-1 p-2 bg-gray-700 rounded text-sm">
                  {selectedNode.data.description || '暂无描述'}
                </div>
              </div>
              <button
                onClick={deleteSelectedNode}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
              >
                🗑️ 删除节点
              </button>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">点击节点查看属性</div>
          )}

          {/* 执行日志 */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-sm">执行日志</h3>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="text-xs">
                  <span className="text-gray-500">{log.time}</span>
                  <span className="ml-1 text-gray-300">{log.message}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-xs text-gray-500">暂无日志</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
