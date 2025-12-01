import { AppRouteRecord } from '@/types/router'

export const dashboardRoutes: AppRouteRecord = {
  name: 'Dashboard',
  path: '/questionnaire',
  component: '/index/index',
  meta: {
    title: 'menus.questionnaire.title',
    icon: 'ri:pie-chart-line',
    roles: ['R_SUPER', 'R_ADMIN'],
  },
  children: [
    {
      path: 'console',
      name: 'Console',
      component: '/questionnaire/console',
      meta: {
        title: 'menus.questionnaire.console',
        keepAlive: false,
        fixedTab: true,
      }
    },
    {
      path: 'answer/:id',
      name: 'Answer',
      component: '/questionnaire/answer',
      meta: {
        title: '量表答题',
        keepAlive: false,
        fixedTab: false,
      }
    }
  ]
}
