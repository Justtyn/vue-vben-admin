import { requestClient } from '#/api/request';

import type { PageResult } from './student';

export interface AdminRecord {
  id: number | string;
  username: string;
  sex?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  lastLoginTime?: string | null;
  lastLoginIp?: string | null;
  createTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPayload {
  username: string;
  password?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface AdminQuery {
  page?: number;
  size?: number;
  keyword?: string;
}

export function fetchAdminPage(params: AdminQuery) {
  return requestClient.get<PageResult<AdminRecord>>('/admins', {
    params,
  });
}

export function createAdmin(data: AdminPayload) {
  return requestClient.post('/admins', data);
}

export function updateAdmin(id: number | string, data: AdminPayload) {
  return requestClient.put(`/admins/${id}`, data);
}

export function deleteAdmin(id: number | string) {
  return requestClient.delete(`/admins/${id}`);
}
