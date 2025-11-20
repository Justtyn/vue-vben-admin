import { requestClient } from '#/api/request';

import type { PageResult } from './student';

export interface TeacherRecord {
  id: number | string;
  username: string;
  sex?: string | null;
  name?: string | null;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  lastLoginTime?: string | null;
  lastLoginIp?: string | null;
  createTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherPayload {
  username: string;
  password?: string;
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
}

export interface TeacherQuery {
  page?: number;
  size?: number;
  keyword?: string;
}

export function fetchTeacherPage(params: TeacherQuery) {
  return requestClient.get<PageResult<TeacherRecord>>('/teachers', {
    params,
  });
}

export function createTeacher(data: TeacherPayload) {
  return requestClient.post('/teachers', data);
}

export function updateTeacher(id: number | string, data: TeacherPayload) {
  return requestClient.put(`/teachers/${id}`, data);
}

export function deleteTeacher(id: number | string) {
  return requestClient.delete(`/teachers/${id}`);
}
