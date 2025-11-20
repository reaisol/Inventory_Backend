export interface PaginationMeta {
  page: number;
  limit: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export function createPaginationMeta(
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta {
  const pageCount = Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    itemCount: totalItems,
    pageCount,
    hasPreviousPage: page > 1,
    hasNextPage: page < pageCount,
  };
}
