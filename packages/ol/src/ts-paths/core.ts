// 给本包类型检查用的点模型镜像。真正的实现在 @turbomap/core。
// 不从那个包再导出，避免把 packages/core 的源码算进本包的 rootDir。

/** 经纬度。经度、纬度单位为度，高度单位为米，可缺省。 */
export interface LngLat {
  longitude: number
  latitude: number
  height?: number
}

/** 一个地图点。id 供拾取；颜色和像素大小可缺省。 */
export interface MapPoint {
  id?: string | number
  position: LngLat
  color?: string
  pixelSize?: number
}
