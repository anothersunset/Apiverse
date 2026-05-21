import { Queue, QueueEvents } from 'bullmq';
import { redisConnection } from '../config/redis.js';

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 4000 },
  removeOnComplete: { age: 3600, count: 1000 },
  removeOnFail: { age: 24 * 3600 },
};

export const queues = {
  script:    new Queue('script-queue',    { connection: redisConnection, defaultJobOptions }),
  character: new Queue('character-queue', { connection: redisConnection, defaultJobOptions }),
  shot:      new Queue('shot-queue',      { connection: redisConnection, defaultJobOptions }),
  voice:     new Queue('voice-queue',     { connection: redisConnection, defaultJobOptions }),
  compose:   new Queue('compose-queue',   { connection: redisConnection, defaultJobOptions: { ...defaultJobOptions, attempts: 2 } }),
};

export const queueEvents = {
  script:    new QueueEvents('script-queue',    { connection: redisConnection }),
  character: new QueueEvents('character-queue', { connection: redisConnection }),
  shot:      new QueueEvents('shot-queue',      { connection: redisConnection }),
  voice:     new QueueEvents('voice-queue',     { connection: redisConnection }),
  compose:   new QueueEvents('compose-queue',   { connection: redisConnection }),
};

export async function closeAllQueues() {
  await Promise.all(Object.values(queues).map((q) => q.close()));
  await Promise.all(Object.values(queueEvents).map((q) => q.close()));
}
