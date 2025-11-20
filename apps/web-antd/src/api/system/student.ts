import { requestClient } from '#/api/request';

export interface PageResult<T> {
  records: T[];
  current: number;
  size: number;
  total: number;
  pages: number;
}

export interface StudentRecord {
  id: number | string;
  username: string;
  sex?: string | null;
  birth?: string | null;
  avatar?: string | null;
  background?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  classId?: number | null;
  school?: string | null;
  ac?: number;
  submit?: number;
  score?: number;
  dailyChallenge?: string | null;
  lastLoginTime?: string | null;
  lastVisitTime?: string | null;
  lastLoginIp?: string | null;
  lastLanguage?: string | null;
  registerIp?: string | null;
  isVerified?: boolean;
  createTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentQuery {
  page?: number;
  size?: number;
  keyword?: string;
  classId?: number | string;
}

export interface StudentPayload {
  username: string;
  password?: string;
  name?: string;
  email?: string;
  phone?: string;
  school?: string;
  classId?: number | string;
}

export function fetchStudentPage(params: StudentQuery) {
  return requestClient.get<PageResult<StudentRecord>>('/students', {
    params,
  });
}

export function createStudent(data: StudentPayload) {
  return requestClient.post('/students', data);
}

export function updateStudent(id: number | string, data: StudentPayload) {
  return requestClient.put(`/students/${id}`, data);
}

export function deleteStudent(id: number | string) {
  return requestClient.delete(`/students/${id}`);
}
