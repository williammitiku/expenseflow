import type { Context } from 'telegraf';
import type { TransactionDraft } from '@expenseflow/shared';
import { ExpenseFlowApi, formatDraft } from '../../services/api-client';
import { needsConfirmation, parseExpenseMessage } from '../../ai/parse-message';
import type { BotConfig } from '../../config/bot.config';

interface PendingDraft {
  draft: TransactionDraft;
  userId: string;
  walletId: string;
  expiresAt: number;
}

const pending = new Map<string, PendingDraft>();

function pendingKey(telegramId: string, draftId: string) {
  return `${telegramId}:${draftId}`;
}

export function createExpenseHandlers(config: BotConfig) {
  const api = new ExpenseFlowApi(config);

  return {
    async handleText(ctx: Context) {
      const text =
        ctx.message && 'text' in ctx.message ? ctx.message.text.trim() : '';
      const from = ctx.from;
      if (!text || !from || text.startsWith('/')) return;

      const draft = parseExpenseMessage(text);
      const tgUser = await api.upsertTelegramUser({
        telegramId: String(from.id),
        firstName: from.first_name || 'Telegram',
        lastName: from.last_name,
        username: from.username,
      });
      const wallet = await api.ensureDefaultWallet(
        tgUser.id,
        draft.currency || 'ETB',
      );

      if (needsConfirmation(draft)) {
        const draftId = `${Date.now()}`;
        pending.set(pendingKey(String(from.id), draftId), {
          draft,
          userId: tgUser.id,
          walletId: wallet.id,
          expiresAt: Date.now() + 5 * 60_000,
        });

        await ctx.reply(
          `I parsed this — please confirm:\n\n${formatDraft(draft)}\n\nConfidence: ${(draft.confidence * 100).toFixed(0)}%`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ Confirm', callback_data: `exp:ok:${draftId}` },
                  { text: '❌ Cancel', callback_data: `exp:no:${draftId}` },
                ],
              ],
            },
          },
        );
        return;
      }

      await api.createTransaction({
        userId: tgUser.id,
        walletId: wallet.id,
        draft,
      });

      await ctx.reply(`✅ Saved\n${formatDraft(draft)}`);
    },

    async handleCallback(ctx: Context) {
      const data =
        ctx.callbackQuery && 'data' in ctx.callbackQuery
          ? ctx.callbackQuery.data
          : undefined;
      const from = ctx.from;
      if (!data || !from || !data.startsWith('exp:')) return;

      const [, action, draftId] = data.split(':');
      const key = pendingKey(String(from.id), draftId);
      const item = pending.get(key);
      pending.delete(key);

      if (!item || item.expiresAt < Date.now()) {
        await ctx.answerCbQuery('Draft expired');
        await ctx.editMessageText('Draft expired. Send the expense again.');
        return;
      }

      if (action === 'no') {
        await ctx.answerCbQuery('Cancelled');
        await ctx.editMessageText('❌ Cancelled — not saved.');
        return;
      }

      if (!(item.draft.amount > 0)) {
        await ctx.answerCbQuery('Invalid amount');
        await ctx.editMessageText(
          'Could not save — amount missing. Try e.g. Coffee 250',
        );
        return;
      }

      await api.createTransaction({
        userId: item.userId,
        walletId: item.walletId,
        draft: item.draft,
      });

      await ctx.answerCbQuery('Saved');
      await ctx.editMessageText(`✅ Saved\n${formatDraft(item.draft)}`);
    },
  };
}
