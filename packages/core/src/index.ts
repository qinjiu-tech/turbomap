// 引擎无关的点位模型。经纬度停在这里，Cartesian3 和 OpenLayers 几何不进这个包。
// 也不依赖调度器，避免用一个坐标类型就要装上帧循环。

/** 经纬度。经度、纬度单位为度，高度单位为米，可缺省。 */
export interface LngLat {
  longitude: number
  latitude: number
  height?: number
}

/** 一个地图点。id 供拾取；颜色和像素大小可缺省，由引擎决定缺省值。 */
export interface MapPoint {
  id?: string | number
  position: LngLat
  color?: string
  pixelSize?: number
}
