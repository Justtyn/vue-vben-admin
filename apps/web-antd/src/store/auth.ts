import type { Recordable, UserInfo } from '@vben/types';
import type { AuthUserInfo } from '#/api';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

function stripBearer(token?: string | null) {
  return token?.replace(/^Bearer\s+/i, '').trim() ?? '';
}

function transformAuthUser(user: AuthUserInfo): UserInfo {
  const normalizedRole = user.role ? user.role.toUpperCase() : '';
  const roles = normalizedRole ? [normalizedRole] : [];
  const realName =
    (user.details?.name as string | undefined) ?? user.username ?? '';

  return {
    avatar: user.avatar ?? preferences.app.defaultAvatar,
    desc:
      (user.details?.title as string | undefined) ??
      normalizedRole ??
      user.role ??
      'ADMIN',
    homePath: preferences.app.defaultHomePath,
    realName,
    roles,
    token: stripBearer(user.token),
    userId: String(user.id),
    username: user.username,
  };
}

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const payload = {
        password: (params.password as string) ?? '',
        role: (params.role as 'student' | 'teacher' | 'admin') ?? 'admin',
        username: (params.username as string) ?? '',
      };
      const { token } = await loginApi(payload);
      const sanitizedToken = stripBearer(token);

      // 如果成功获取到 accessToken
      if (sanitizedToken) {
        accessStore.setAccessToken(sanitizedToken);

        // 获取用户信息并存储到 accessStore 中
        const fetchUserInfoResult = await fetchUserInfo();

        userInfo = fetchUserInfoResult;

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName || userInfo?.username) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName || userInfo?.username}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      if (accessStore.accessToken) {
        await logoutApi();
      }
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: null | UserInfo = null;
    const authUser = await getUserInfoApi();
    userInfo = transformAuthUser(authUser);
    userStore.setUserInfo(userInfo);
    accessStore.setAccessCodes(userInfo.roles ?? []);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
