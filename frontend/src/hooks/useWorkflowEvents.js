'use client';
import { useEffect, useState } from 'react';

/**
 * 订阅工作流 SSE 事件。
 * 返回累计事件数组 + 最新一条 lastEvent。
 */
export default function useWorkflowEvents(workflowId) {
  const [events, setEvents] = useState([]);
  const [lastEvent, setLastEvent] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!workflowId) return;
    const url = `/api/video-workflows/${workflowId}/events`;
    const es = new EventSource(url);
    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setLastEvent(data);
        setEvents((prev) => [...prev.slice(-199), data]);
      } catch {}
    };
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [workflowId]);

  return { events, lastEvent, connected };
}
