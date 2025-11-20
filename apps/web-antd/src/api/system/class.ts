import { requestClient } from '#/api/request';

import type { PageResult } from './student';

export interface ClassRecord {
  id: number | string;
  name: string;
  code: string;
  description?: string | null;
  creatorId?: number | string;
}

export interface ClassQuery {
  page?: number;
  size?: number;
  keyword?: string;
}

export function fetchClassPage(params: ClassQuery = {}) {
  return requestClient.get<PageResult<ClassRecord>>('/classes', {
    params,
  });
}
