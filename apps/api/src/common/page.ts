export function pageResult<T>(items: T[], total: number, page: number, pageSize: number) {
  return { items, meta: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
}
