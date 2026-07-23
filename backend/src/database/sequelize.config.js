/**
 * Shared Sequelize CLI / runtime connection options.
 * Supports Neon via DATABASE_URL or local POSTGRES_* vars.
 */
const path = require('path');
const { buildDatabaseConnection } = require('./db-connection');

try {
  require('dotenv').config({
    path: path.resolve(__dirname, '../../../.env'),
  });
} catch {
  // env may be injected by the host (Railway / Docker)
}

const conn = buildDatabaseConnection();

module.exports = {
  dialect: 'postgres',
  host: conn.host,
  port: conn.port,
  username: conn.username,
  password: conn.password,
  database: conn.database,
  logging: conn.logging ? console.log : false,
  dialectOptions: conn.dialectOptions,
  define: {
    underscored: true,
    timestamps: true,
    paranoid: true,
  },
  pool: conn.pool,
};
