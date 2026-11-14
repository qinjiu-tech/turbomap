// 打点的默认色。缓存对象不要被业务改写，调用方需要别的颜色时另建 Color。
// CSS 字符串在十万级点上会反复解析，所以按字符串缓存。

import * as Cesium from 'cesium'

export const POINT_COLOR = Cesium.Color.fromCssColorString('#38bdf8')

// 缓存放在模块里，同一颜色字符串在多个任务之间共用一次解析结果。
const cache = new Map<string, Cesium.Color>()

/** 解析 CSS 颜色。value 为空时返回 fallback，不再次解析。 */
export function colorFromCss(value: string | undefined, fallback: Cesium.Color): Cesium.Color {
  if (!value) return fallback
  const cached = cache.get(value)
  // 命中缓存就返回同一对象，避免十万次 fromCssColorString。
  if (cached) return cached
  const parsed = Cesium.Color.fromCssColorString(value)
  cache.set(value, parsed)
  return parsed
}
