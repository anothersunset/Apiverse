// 最小闭环验证：全部 provider=mock 下，从创建到拿到 final.mp4
// node --test tests/e2e/workflow.test.js (服务须预先运行于 localhost:5000)
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL || 'http://localhost:5000';

test('full mock workflow produces final.mp4', { timeout: 120000 }, async () => {
  const create = await fetch(`${BASE}/api/video-workflows`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ topic: 'e2e test', sceneCount: 2, durationSec: 6 }),
  }).then((r) => r.json());
  assert.ok(create.workflowId, 'workflowId returned');

  // 轮询其进程
  const start = Date.now();
  let final = null;
  while (Date.now() - start < 110000) {
    await new Promise((r) => setTimeout(r, 2500));
    const st = await fetch(`${BASE}/api/video-workflows/${create.workflowId}`).then((r) => r.json());
    if (st.status === 'completed') { final = st.compose; break; }
    if (st.status === 'failed')    throw new Error('workflow failed: ' + JSON.stringify(st.logs?.slice(-3)));
  }
  assert.ok(final?.finalVideoUrl, 'finalVideoUrl produced');
});
