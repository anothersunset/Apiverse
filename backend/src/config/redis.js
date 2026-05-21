import IORedis from 'ioredis';

const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// BullMQ 要求 maxRetriesPerRequest=null
export const redisConnection = new IORedis(url, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on('error', (err) => {
  console.error('[redis] error:', err.message);
});
redisConnection.on('connect', () => {
  console.log('[redis] connected:', url);
});
