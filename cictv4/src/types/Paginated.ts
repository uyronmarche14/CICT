export type SortConfig = {
  field: string;
  direction: 'asc' | 'desc';
} | null;

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
