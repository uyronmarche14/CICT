export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function parsePagination(
  query: Record<string, unknown>,
  defaultLimit = 10,
  maxLimit = 100
): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page), 10) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(query.limit), 10) || defaultLimit)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> {
  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
    pages: Math.ceil(total / params.limit),
    hasNextPage: params.page * params.limit < total,
    hasPrevPage: params.page > 1,
  };
}
