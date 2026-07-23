/**
 * Resolve Postgres connection from DATABASE_URL (Neon) or discrete POSTGRES_* vars.
 */
function parseDatabaseUrl(urlString) {
  const url = new URL(urlString);
  return {
    host: url.hostname,
    port: parseInt(url.port || '5432', 10),
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, '') || 'postgres',
  };
}

function buildDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const useSsl =
    process.env.DB_SSL === 'true' ||
    Boolean(databaseUrl && /neon\.tech|sslmode=require/i.test(databaseUrl));

  const base = databaseUrl
    ? parseDatabaseUrl(databaseUrl)
    : {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
        username: process.env.POSTGRES_USER || 'expenseflow',
        password: process.env.POSTGRES_PASSWORD || 'expenseflow',
        database: process.env.POSTGRES_DB || 'expenseflow',
      };

  return {
    ...base,
    logging: process.env.DB_LOGGING === 'true',
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
          application_name: 'expenseflow-api',
        }
      : {
          application_name: 'expenseflow-api',
        },
    pool: {
      // Neon / serverless-friendly pool
      max: parseInt(process.env.DB_POOL_MAX || '5', 10),
      min: 0,
      acquire: 30_000,
      idle: 10_000,
    },
  };
}

module.exports = { buildDatabaseConnection, parseDatabaseUrl };
