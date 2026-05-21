'use client';
import { useState } from 'react';
import TaskPanel from '../../../components/workflow/TaskPanel.jsx';

export default function WorkflowRunnerPage() {
  const [form, setForm] = useState({
    topic: '一只狐狸探险 API 世界',
    style: 'cinematic',
    sceneCount: 3,
    durationSec: 15,
    aspectRatio: '9:16',
  });
  const [workflowId, setWorkflowId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/video-workflows', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'failed');
      setWorkflowId(data.workflowId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">🎥 AI 视频生成 · 实时运行台</h1>
        <p className="text-gray-600 text-sm mt-1">从主题到 mp4 的闭环。默认 mock 模式，零成本验证。</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded-lg bg-white">
        <div>
          <label className="text-sm font-medium">主题</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium">风格</label>
            <select className="mt-1 w-full border rounded px-2 py-2" value={form.style}
              onChange={(e) => setForm({ ...form, style: e.target.value })}>
              <option value="cinematic">电影感</option>
              <option value="anime">动漫</option>
              <option value="realistic">写实</option>
              <option value="vlog">Vlog</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">镜头数</label>
            <input type="number" min={1} max={8} className="mt-1 w-full border rounded px-3 py-2"
              value={form.sceneCount}
              onChange={(e) => setForm({ ...form, sceneCount: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm font-medium">总时长(s)</label>
            <input type="number" min={6} max={120} className="mt-1 w-full border rounded px-3 py-2"
              value={form.durationSec}
              onChange={(e) => setForm({ ...form, durationSec: Number(e.target.value) })} />
          </div>
        </div>
        <button type="submit" disabled={submitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
          {submitting ? '创建中…' : '🚀 启动工作流'}
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>

      {workflowId && <TaskPanel workflowId={workflowId} />}
    </div>
  );
}
