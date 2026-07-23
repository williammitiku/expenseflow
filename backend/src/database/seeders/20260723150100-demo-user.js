'use strict';

const { randomUUID } = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('users', [
      {
        id: randomUUID(),
        telegram_id: null,
        username: 'demo',
        first_name: 'Demo',
        last_name: 'User',
        email: 'demo@expenseflow.local',
        avatar_url: null,
        role: 'user',
        preferred_currency: 'ETB',
        timezone: 'Africa/Addis_Ababa',
        settings: JSON.stringify({ darkMode: true, notifyChannels: ['in_app'] }),
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'demo@expenseflow.local' });
  },
};
