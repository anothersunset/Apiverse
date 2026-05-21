'use client';
import { useState } from 'react';
import useWorkflowEvents from '../../hooks/useWorkflowEvents.js';

const STAGE_LABEL = {
  script: '📝 生成脚本',
  character: '🎭 生成角色',
  shots: '🎬 渲染镜头',
  voice: '🎤 生成配音',
  compose: '✨ 合成视频',
  init: '🚀 初始化',
};

export default function TaskPanel({ workflowId }) {
  const { events, lastEvent, connected } = useWorkflowEvents(workflowId);
  const [status, setStatus] = useState(null);
  const [final, setFinal] = useState(null);

  // 定时拉取完整状态
  if (workflowId && !status) {
    fetch(`/api/video-workflows/${workflowId}`).then((r) => r.json()).then(setStatus);
  }

  // 检测到 completed 事件后取最终产物
  if (lastEvent?.stage === 'compose' && lastEvent?.status === 'done' && !final) {
    fetch(`/api/video-workflows/${workflowId}/final`).then((r) => r.json()).then(setFinal);
  }

  if (!workflowId) {
    return <div className="p-4 text-gray-500">请先创建一个工作流</div>;
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">工作流 {workflowId}</h3>
        <span className={`px-2 py-1 text-xs rounded ${connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {connected ? '● 实时连接中' : '○ 未连接'}
        </span>
      </div>

      <div className="text-sm text-gray-700">
        <strong>状态：</strong>{lastEvent?.stage ? STAGE_LABEL[lastEvent.stage] || lastEvent.stage : '等待中'}
        {lastEvent?.status ? ` · ${lastEvent.status}` : ''}
      </div>

      {final?.finalVideoUrl && (
        <div className="mt-3 space-y-2">
          <div className="text-green-700 font-semibold">✅ 合成完成</div>
          <video src={final.finalVideoUrl} controls poster={final.coverUrl} className="w-full max-w-md rounded" />
          <a href={final.finalVideoUrl} download className="inline-block px-3 py-1 bg-indigo-600 text-white rounded text-sm">下载 MP4</a>
        </div>
      )}

      <details>
        <summary className="cursor-pointer text-sm text-gray-600">事件流 ({events.length})</summary>
        <pre className="mt-2 max-h-64 overflow-auto text-xs bg-gray-50 p-2 rounded">
          {events.slice(-50).map((e, i) => (
            <div key={i}>{new Date(e.ts || Date.now()).toLocaleTimeString()} · {e.stage} · {e.status || ''} {e.sceneId ? `(${e.sceneId})` : ''}{e.error ? ` ⚠️ ${e.error}` : ''}</div>
          ))}
        </pre>
      </details>
    </div>
  );
}
