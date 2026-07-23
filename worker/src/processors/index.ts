import { Worker, type ConnectionOptions } from 'bullmq';
import { QUEUE_NAMES } from '@expenseflow/shared';
import type IORedis from 'ioredis';

type RedisConn = IORedis;

function stubProcessor(queueName: string) {
  return async (job: { id?: string; name: string }) => {
    console.log(`[${queueName}] processed job ${job.name} (${job.id ?? 'n/a'}) — stub`);
    return { ok: true };
  };
}

export function createWorkers(connection: RedisConn) {
  const conn = connection as unknown as ConnectionOptions;

  return Object.values(QUEUE_NAMES).map(
    (queueName) =>
      new Worker(queueName, stubProcessor(queueName), {
        connection: conn,
        concurrency: 2,
      }),
  );
}
