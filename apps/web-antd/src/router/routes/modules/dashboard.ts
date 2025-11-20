import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    meta: {
      hideInMenu: true,
      order: 999,
      title: '仪表盘',
    },
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          affixTab: true,
          hideInMenu: true,
          title: '仪表盘',
        },
      },
    ],
  },
];

export default routes;
