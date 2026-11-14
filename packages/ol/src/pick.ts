// 从点击像素取出业务 id。WebGL 点图层默认开着命中检测，关闭后这里会拿不到要素。
// 只返回 id，不把 OpenLayers 的 Feature 交给调用方。

import type Map from 'ol/Map'
import type { Pixel } from 'ol/pixel'

/** 在像素处取最近要素的 id。没有命中时返回 undefined。 */
export function pickFeatureId(map: Map, pixel: Pixel): unknown {
  const feature = map.forEachFeatureAtPixel(pixel, (hit) => hit)
  // getId 是写入要素时的业务 id。没有命中时 Feature 为空，返回 undefined。
  return feature?.getId()
}
