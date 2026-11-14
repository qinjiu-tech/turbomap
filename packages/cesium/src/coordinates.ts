// 只把 core 里的经纬度换成 Cesium 椭球坐标。返回值是 Cartesian3，所以不能放进 core。
// 不做 3857 或 CGCS2000。当前只有这一个引擎在消费坐标。

import * as Cesium from 'cesium'
import type { LngLat } from '@turbomap/core'

export type { LngLat }

/** 经纬度转 Cartesian3。缺省高度为 0。这个类型不进入 core，也不进入调度器。 */
export function toCartesian(position: LngLat): Cesium.Cartesian3 {
  // 高度缺省为 0。点贴在椭球面上，再由 Viewer 关掉深度检测，避免被地表裁掉。
  return Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.height ?? 0)
}
