import { requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password: string;
    role: 'student' | 'teacher' | 'admin';
    username: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    role: string;
    token: string;
    userId: number;
    username: string;
  }
}

export interface AuthUserInfo {
  avatar?: string | null;
  details?: Record<string, any>;
  email?: string | null;
  id: number;
  role: 'student' | 'teacher' | 'admin';
  token?: string | null;
  username: string;
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return requestClient.post('/auth/logout');
}
