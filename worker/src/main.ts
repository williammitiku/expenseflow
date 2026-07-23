import 'dotenv/config';
import { APP_NAME, QUEUE_NAMES } from '@expenseflow/shared';
import { createWorkers } from './processors';
import { loadWorkerConfig } from './config/worker.config';
import { createRedisConnection } from './config/redis';

async function main() {
  const config = loadWorkerConfig();
  const connection = createRedisConnection(config.redisUrl);

  connection.on('connect', () => {
    console.log(`[${APP_NAME} Worker] Redis connected`);
  });

  connection.on('error', (err) => {
    console.error(`[${APP_NAME} Worker] Redis error:`, err.message);
  });

  const workers = createWorkers(connection);
  console.log(
    `[${APP_NAME} Worker] listening on queues: ${Object.values(QUEUE_NAMES).join(', ')}`,
  );

  const shutdown = async () => {
    await Promise.all(workers.map((w) => w.close()));
    connection.disconnect();
    process.exit(0);
  };

  process.once('SIGINT', () => void shutdown());
  process.once('SIGTERM', () => void shutdown());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
