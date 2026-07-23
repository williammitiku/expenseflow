import { PAGINATION } from '@expenseflow/shared';

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number = PAGINATION.DEFAULT_PAGE,
  limit: number = PAGINATION.DEFAULT_LIMIT,
) {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
