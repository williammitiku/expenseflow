'use strict';

const { DataTypes } = require('sequelize');

const uuidPk = (qi) => ({
  type: DataTypes.UUID,
  allowNull: false,
  primaryKey: true,
  defaultValue: qi.sequelize.literal('gen_random_uuid()'),
});

const timestamps = (qi) => ({
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: qi.sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: qi.sequelize.literal('CURRENT_TIMESTAMP'),
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const qi = queryInterface;

    await qi.createTable('sessions', {
      id: uuidPk(qi),
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      refresh_token_hash: { type: DataTypes.STRING(255), allowNull: false },
      user_agent: { type: DataTypes.STRING(512), allowNull: true },
      ip: { type: DataTypes.STRING(64), allowNull: true },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      revoked_at: { type: DataTypes.DATE, allowNull: true },
      ...timestamps(qi),
    });
    await qi.addIndex('sessions', ['user_id'], { name: 'sessions_user_id_idx' });
    await qi.addIndex('sessions', ['refresh_token_hash'], {
      name: 'sessions_refresh_token_hash_idx',
    });

    await qi.createTable('categories', {
      id: uuidPk(qi),
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      name: { type: DataTypes.STRING(120), allowNull: false },
      type: {
        type: DataTypes.ENUM('expense', 'income', 'both'),
        allowNull: false,
        defaultValue: 'expense',
      },
      icon: { type: DataTypes.STRING(64), allowNull: true },
      color: { type: DataTypes.STRING(32), allowNull: true },
      parent_id: { type: DataTypes.UUID, allowNull: true },
      is_system: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ...timestamps(qi),
    });
    await qi.addIndex('categories', ['user_id'], { name: 'categories_user_id_idx' });
    await qi.addIndex('categories', ['type'], { name: 'categories_type_idx' });

    await qi.createTable('tags', {
      id: uuidPk(qi),
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: DataTypes.STRING(64), allowNull: false },
      ...timestamps(qi),
    });
    await qi.sequelize.query(`
      CREATE UNIQUE INDEX tags_user_id_name_unique
      ON tags (user_id, name)
      WHERE deleted_at IS NULL;
    `);

    await qi.createTable('wallets', {
      id: uuidPk(qi),
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: DataTypes.STRING(120), allowNull: false },
      type: {
        type: DataTypes.ENUM(
          'cash',
          'bank',
          'telebirr',
          'cbe',
          'dashen',
          'visa',
          'mastercard',
          'crypto',
          'other',
        ),
        allowNull: false,
        defaultValue: 'cash',
      },
      currency: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: 'ETB' },
      balance: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
      },
      is_shared: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ...timestamps(qi),
    });
    await qi.addIndex('wallets', ['user_id'], {
      name: 'wallets_user_id_idx',
      where: { deleted_at: null },
    });

    await qi.createTable('wallet_members', {
      id: uuidPk(qi),
      wallet_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'wallets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: DataTypes.ENUM('owner', 'admin', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer',
      },
      ...timestamps(qi),
    });
    await qi.addIndex('wallet_members', ['wallet_id', 'user_id'], {
      name: 'wallet_members_wallet_user_unique',
      unique: true,
    });

    await qi.createTable('recurring_rules', {
      id: uuidPk(qi),
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      template: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      frequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
        allowNull: false,
        defaultValue: 'monthly',
      },
      next_run_at: { type: DataTypes.DATE, allowNull: false },
      active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      ...timestamps(qi),
    });
    await qi.addIndex('recurring_rules', ['user_id', 'active'], {
      name: 'recurring_rules_user_active_idx',
    });

    await qi.createTable('transactions', {
      id: uuidPk(qi),
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      wallet_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'wallets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      type: {
        type: DataTypes.ENUM('expense', 'income', 'transfer', 'refund'),
        allowNull: false,
      },
      amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
      currency: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: 'ETB' },
      merchant: { type: DataTypes.STRING(255), allowNull: true },
      note: { type: DataTypes.TEXT, allowNull: true },
      location: { type: DataTypes.STRING(255), allowNull: true },
      receipt_image_key: { type: DataTypes.STRING(512), allowNull: true },
      occurred_at: { type: DataTypes.DATE, allowNull: false },
      transfer_wallet_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'wallets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      parent_transaction_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'transactions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      is_recurring: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      recurring_rule_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'recurring_rules', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      ...timestamps(qi),
    });
    await qi.sequelize.query(`
      CREATE INDEX transactions_user_occurred_idx
      ON transactions (user_id, occurred_at DESC)
      WHERE deleted_at IS NULL;
    `);
    await qi.sequelize.query(`
      CREATE INDEX transactions_wallet_occurred_idx
      ON transactions (wallet_id, occurred_at DESC)
      WHERE deleted_at IS NULL;
    `);
    await qi.addIndex('transactions', ['user_id', 'type', 'occurred_at'], {
      name: 'transactions_user_type_occurred_idx',
    });

    await qi.createTable('transaction_tags', {
      id: uuidPk(qi),
      transaction_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'transactions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tag_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tags', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: qi.sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: qi.sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await qi.addIndex('transaction_tags', ['transaction_id', 'tag_id'], {
      name: 'transaction_tags_unique',
      unique: true,
    });

    await qi.createTable('split_shares', {
      id: uuidPk(qi),
      transaction_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'transactions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      label: { type: DataTypes.STRING(120), allowNull: false },
      amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
      settled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      ...timestamps(qi),
    });
    await qi.addIndex('split_shares', ['transaction_id'], {
      name: 'split_shares_transaction_id_idx',
    });

    await qi.createTable('budgets', {
      id: uuidPk(qi),
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: DataTypes.STRING(120), allowNull: false },
      period: {
        type: DataTypes.ENUM('weekly', 'monthly', 'yearly'),
        allowNull: false,
        defaultValue: 'monthly',
      },
      amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
      currency: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: 'ETB' },
      category_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      wallet_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'wallets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      alert_thresholds: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [50, 75, 90, 100],
      },
      start_date: { type: DataTypes.DATEONLY, allowNull: false },
      ...timestamps(qi),
    });
    await qi.addIndex('budgets', ['user_id'], { name: 'budgets_user_id_idx' });

    await qi.createTable('goals', {
      id: uuidPk(qi),
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: DataTypes.STRING(120), allowNull: false },
      target_amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
      current_amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
      },
      currency: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: 'ETB' },
      deadline: { type: DataTypes.DATEONLY, allowNull: true },
      wallet_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'wallets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      ...timestamps(qi),
    });
    await qi.addIndex('goals', ['user_id'], { name: 'goals_user_id_idx' });

    await qi.createTable('receipts', {
      id: uuidPk(qi),
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      s3_key: { type: DataTypes.STRING(512), allowNull: false },
      status: {
        type: DataTypes.ENUM('pending', 'done', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      extracted: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      suggested_category_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      transaction_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'transactions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      ...timestamps(qi),
    });
    await qi.addIndex('receipts', ['user_id', 'status'], {
      name: 'receipts_user_status_idx',
    });

    await qi.createTable('notifications', {
      id: uuidPk(qi),
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      channel: {
        type: DataTypes.ENUM('telegram', 'email', 'push', 'in_app'),
        allowNull: false,
        defaultValue: 'in_app',
      },
      type: { type: DataTypes.STRING(64), allowNull: false },
      payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      status: {
        type: DataTypes.ENUM('pending', 'sent', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      sent_at: { type: DataTypes.DATE, allowNull: true },
      ...timestamps(qi),
    });
    await qi.addIndex('notifications', ['user_id', 'status'], {
      name: 'notifications_user_status_idx',
    });

    await qi.createTable('subscriptions', {
      id: uuidPk(qi),
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      plan: {
        type: DataTypes.ENUM('free', 'premium'),
        allowNull: false,
        defaultValue: 'free',
      },
      status: {
        type: DataTypes.ENUM('active', 'canceled', 'past_due'),
        allowNull: false,
        defaultValue: 'active',
      },
      current_period_end: { type: DataTypes.DATE, allowNull: true },
      provider_ref: { type: DataTypes.STRING(255), allowNull: true },
      ...timestamps(qi),
    });

    await qi.createTable('export_jobs', {
      id: uuidPk(qi),
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      format: {
        type: DataTypes.ENUM('csv', 'xlsx', 'pdf'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'ready', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      s3_key: { type: DataTypes.STRING(512), allowNull: true },
      params: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      ...timestamps(qi),
    });
    await qi.addIndex('export_jobs', ['user_id', 'status'], {
      name: 'export_jobs_user_status_idx',
    });

    await qi.createTable('feature_flags', {
      id: uuidPk(qi),
      key: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      rules: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      ...timestamps(qi),
    });

    await qi.createTable('support_tickets', {
      id: uuidPk(qi),
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      subject: { type: DataTypes.STRING(255), allowNull: false },
      status: {
        type: DataTypes.ENUM('open', 'pending', 'closed'),
        allowNull: false,
        defaultValue: 'open',
      },
      body: { type: DataTypes.TEXT, allowNull: false },
      ...timestamps(qi),
    });
    await qi.addIndex('support_tickets', ['user_id', 'status'], {
      name: 'support_tickets_user_status_idx',
    });

    await qi.createTable('audit_logs', {
      id: uuidPk(qi),
      actor_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      action: { type: DataTypes.STRING(120), allowNull: false },
      resource: { type: DataTypes.STRING(120), allowNull: false },
      resource_id: { type: DataTypes.UUID, allowNull: true },
      ip: { type: DataTypes.STRING(64), allowNull: true },
      meta: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: qi.sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await qi.addIndex('audit_logs', ['actor_user_id', 'created_at'], {
      name: 'audit_logs_actor_created_idx',
    });
  },

  async down(queryInterface) {
    const tables = [
      'audit_logs',
      'support_tickets',
      'feature_flags',
      'export_jobs',
      'subscriptions',
      'notifications',
      'receipts',
      'goals',
      'budgets',
      'split_shares',
      'transaction_tags',
      'transactions',
      'recurring_rules',
      'wallet_members',
      'wallets',
      'tags',
      'categories',
      'sessions',
    ];
    for (const table of tables) {
      await queryInterface.dropTable(table);
    }

    const enums = [
      'enum_categories_type',
      'enum_wallets_type',
      'enum_wallet_members_role',
      'enum_recurring_rules_frequency',
      'enum_transactions_type',
      'enum_budgets_period',
      'enum_receipts_status',
      'enum_notifications_channel',
      'enum_notifications_status',
      'enum_subscriptions_plan',
      'enum_subscriptions_status',
      'enum_export_jobs_format',
      'enum_export_jobs_status',
      'enum_support_tickets_status',
    ];
    for (const e of enums) {
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${e}";`);
    }
  },
};
