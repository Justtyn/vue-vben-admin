import type { AuthUserInfo } from './auth';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<AuthUserInfo>('/auth/users/me');
}

export type { AuthUserInfo };
