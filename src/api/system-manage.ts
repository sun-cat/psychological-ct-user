import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// 获取量表列表 new
export function assessList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/answer/list',
    params
  })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

// 获取菜单列表
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/v3/system/menus/simple'
  })
}

/* 
 生成PDF格式的报告 new
*/
export const getResultPdf = (id: string | number) => {
  return request.get({
    url: '/report/pdf/' + id,
    responseType: 'blob'
  })
}
