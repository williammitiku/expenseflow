'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
      },
      telegram_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      first_name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      avatar_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      },
      preferred_currency: {
        type: DataTypes.CHAR(3),
        allowNull: false,
        defaultValue: 'ETB',
      },
      timezone: {
        type: DataTypes.STRING(64),
        allowNull: false,
        defaultValue: 'Africa/Addis_Ababa',
      },
      settings: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: queryInterface.sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: queryInterface.sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX users_telegram_id_unique
      ON users (telegram_id)
      WHERE telegram_id IS NOT NULL AND deleted_at IS NULL;
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX users_email_unique
      ON users (email)
      WHERE email IS NOT NULL AND deleted_at IS NULL;
    `);

    await queryInterface.addIndex('users', ['deleted_at'], {
      name: 'users_deleted_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  },
};
