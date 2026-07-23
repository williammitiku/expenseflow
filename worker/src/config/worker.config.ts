export interface WorkerConfig {
  redisUrl: string;
  apiBaseUrl: string;
  internalApiKey: string;
}

export function loadWorkerConfig(): WorkerConfig {
  const host = process.env.REDIS_HOST ?? 'localhost';
  const port = process.env.REDIS_PORT ?? '6379';
  const password = process.env.REDIS_PASSWORD;

  const redisUrl =
    process.env.REDIS_URL ??
    (password
      ? `redis://:${password}@${host}:${port}`
      : `redis://${host}:${port}`);

  return {
    redisUrl,
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3000/api/v1',
    internalApiKey: process.env.INTERNAL_API_KEY ?? '',
  };
}
