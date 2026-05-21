// Next.js 代理路由：把前端的 /api/video-workflows/** 转发到后端
const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

async function proxy(req, ctx) {
  const segs = ctx.params?.path || [];
  const target = `${BACKEND}/api/video-workflows/${segs.join('/')}`;

  // SSE 路径：保持流式
  if (target.endsWith('/events')) {
    const r = await fetch(target, { method: 'GET', cache: 'no-store' });
    return new Response(r.body, {
      status: r.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  }

  const init = {
    method: req.method,
    headers: { 'content-type': 'application/json' },
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.text();
  }
  const r = await fetch(target, init);
  const text = await r.text();
  return new Response(text, {
    status: r.status,
    headers: { 'Content-Type': r.headers.get('content-type') || 'application/json' },
  });
}

export async function GET(req, ctx)    { return proxy(req, ctx); }
export async function POST(req, ctx)   { return proxy(req, ctx); }
export async function DELETE(req, ctx) { return proxy(req, ctx); }

export const dynamic = 'force-dynamic';
