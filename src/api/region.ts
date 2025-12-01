import request from '@/utils/http'

/**
 * 地区数据项接口
 */
export interface RegionItem {
  value: string // 地区代码
  label: string // 地区名称
  children?: RegionItem[] // 子地区
}

/**
 * 获取地区数据
 * TODO: 当需要从后端获取地区数据时，请实现此接口
 * @returns Promise<RegionItem[]> 地区数据数组（省市区三级联动）
 */
export function getRegionData() {
  return request.get<RegionItem[]>({
    url: '/region/list'
  })
}

/**
 * 根据地区代码获取地区名称
 * TODO: 如果后端需要此接口，请实现
 * @param codes 地区代码数组，例如：['110000', '110100', '110101']
 * @returns Promise<string> 地区名称字符串，例如：'北京市 / 北京市 / 东城区'
 */
export function getRegionNameByCodes(codes: string[]) {
  return request.post<string>({
    url: '/region/getNameByCodes',
    data: { codes }
  })
}

/**
 * 根据地区名称获取地区代码
 * TODO: 如果后端需要此接口，请实现
 * @param names 地区名称字符串，例如：'北京市 / 北京市 / 东城区'
 * @returns Promise<string[]> 地区代码数组，例如：['110000', '110100', '110101']
 */
export function getRegionCodesByName(names: string) {
  return request.post<string[]>({
    url: '/region/getCodesByName',
    data: { names }
  })
}
