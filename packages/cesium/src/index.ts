// Cesium 适配的公开入口。颜色和 id 工具留在包内，不从这里导出。
// 再导出调度器和点模型，调用方打点时不必再装一层 core。

export type { LngLat, MapPoint } from '@turbomap/core'
export { toCartesian } from './coordinates'
export { createCesiumMap, CesiumMap } from './CesiumMap'
export type { CesiumMapOptions } from './CesiumMap'
// FrameHost 一并导出，方便替换帧循环。
export { createCesiumFrameHost } from './frameHost'
// 拾取只返回业务 id，不把 Cesium 的图元对象漏给调用方。
export { pickObjectId } from './pick'
// 调度器的实现来自 @turbomap/scheduler，这里再导出，调用方不用单独装调度包。
export { TaskScheduler } from '@turbomap/scheduler'
export type {
  FrameHost,
  SchedulableTask,
  TaskSchedulerOptions,
  TaskSnapshot,
  TaskStatus,
} from '@turbomap/scheduler'
export { createPointsTask } from './tasks/points'
export type { PointInput, PointsTaskOptions } from './tasks/points'
