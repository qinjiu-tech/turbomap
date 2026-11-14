// 点、面、飞线共用的拾取入口。三种任务都把业务标识写在同一个字段上。
// 不在这里区分图形类型，调用方拿到 id 后再决定怎么用。

import * as Cesium from 'cesium'

/** 从窗口坐标取出业务 id。点、面、飞线都写在图元 id 上，这里不区分图形类型。 */
export function pickObjectId(viewer: Cesium.Viewer, windowPosition: Cesium.Cartesian2): unknown {
  const picked = viewer.scene.pick(windowPosition) as { id?: unknown } | undefined
  return picked?.id
}
