import { requestClient } from '#/api/request';

import type { PageResult } from './student';

export interface LoginLogRecord {
  id: number | string;
  userId: number | string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  ipAddress: string;
  location?: string | null;
  userAgent?: string | null;
  device?: string | null;
  success: boolean;
  failReason?: string | null;
  loginTime: string;
  logoutTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginLogQuery {
  page?: number;
  size?: number;
  role?: string;
  userId?: string | number;
  startTime?: string;
  endTime?: string;
}

export function fetchLoginLogs(params: LoginLogQuery) {
  return requestClient.get<PageResult<LoginLogRecord>>('/login-logs', {
    params,
  });
}
