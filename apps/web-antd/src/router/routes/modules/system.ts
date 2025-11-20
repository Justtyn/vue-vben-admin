import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'System',
    path: '/system',
    meta: {
      icon: 'carbon:user-multiple',
      order: 10,
      title: '系统管理',
      authority: ['ADMIN', 'TEACHER'],
    },
    children: [
      {
        name: 'SystemStudent',
        path: '/system/students',
        component: () => import('#/views/system/user/student/index.vue'),
        meta: {
          title: '学生管理',
          authority: ['ADMIN', 'TEACHER'],
        },
      },
      {
        name: 'SystemTeacher',
        path: '/system/teachers',
        component: () => import('#/views/system/user/teacher/index.vue'),
        meta: {
          title: '教师管理',
          authority: ['ADMIN'],
        },
      },
      {
        name: 'SystemAdmin',
        path: '/system/admins',
        component: () => import('#/views/system/user/admin/index.vue'),
        meta: {
          title: '管理员管理',
          authority: ['ADMIN'],
        },
      },
      {
        name: 'SystemLoginLog',
        path: '/system/login-logs',
        component: () => import('#/views/system/log/login/index.vue'),
        meta: {
          title: '登录日志',
          authority: ['ADMIN'],
        },
      },
    ],
  },
];

export default routes;
