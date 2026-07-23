'use strict';

const { randomUUID } = require('crypto');

const SYSTEM_CATEGORIES = [
  { name: 'Food & Drink', type: 'expense', icon: 'coffee', color: '#3ECF8E' },
  { name: 'Transport', type: 'expense', icon: 'car', color: '#5B8DEF' },
  { name: 'Shopping', type: 'expense', icon: 'bag', color: '#F5C654' },
  { name: 'Bills', type: 'expense', icon: 'bolt', color: '#F07178' },
  { name: 'Health', type: 'expense', icon: 'heart', color: '#E06C75' },
  { name: 'Entertainment', type: 'expense', icon: 'film', color: '#C678DD' },
  { name: 'Salary', type: 'income', icon: 'bank', color: '#98C379' },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#56B6C2' },
  { name: 'Investment', type: 'income', icon: 'chart', color: '#61AFEF' },
  { name: 'Other', type: 'both', icon: 'dots', color: '#ABB2BF' },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'categories',
      SYSTEM_CATEGORIES.map((c) => ({
        id: randomUUID(),
        user_id: null,
        name: c.name,
        type: c.type,
        icon: c.icon,
        color: c.color,
        parent_id: null,
        is_system: true,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      })),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', { is_system: true });
  },
};
