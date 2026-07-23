import { registerAs } from '@nestjs/config';

function parseDatabaseUrl(urlString: string) {
  const url = new URL(urlString);
  return {
    host: url.hostname,
    port: parseInt(url.port || '5432', 10),
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, '') || 'postgres',
  };
}

export const databaseConfig = registerAs('database', () => {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const useSsl =
    process.env.DB_SSL === 'true' ||
    Boolean(databaseUrl && /neon\.tech|sslmode=require/i.test(databaseUrl));

  const parsed = databaseUrl
    ? parseDatabaseUrl(databaseUrl)
    : {
        host: process.env.POSTGRES_HOST ?? 'localhost',
        port: parseInt(process.env.POSTGRES_PORT ?? '5433', 10),
        username: process.env.POSTGRES_USER ?? 'expenseflow',
        password: process.env.POSTGRES_PASSWORD ?? 'expenseflow',
        database: process.env.POSTGRES_DB ?? 'expenseflow',
      };

  return {
    ...parsed,
    url: databaseUrl,
    ssl: useSsl,
    logging: process.env.DB_LOGGING === 'true',
    synchronize: false,
    poolMax: parseInt(process.env.DB_POOL_MAX ?? '5', 10),
  };
});

export const redisConfig = registerAs('redis', () => {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const url = new URL(redisUrl);
    return {
      url: redisUrl,
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password ? decodeURIComponent(url.password) : undefined,
      tls: url.protocol === 'rediss:',
    };
  }

  return {
    url: undefined as string | undefined,
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true',
  };
});
