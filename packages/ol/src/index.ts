// OpenLayers 适配的公开入口。任务 id 工具留在包内。
// 再导出调度器和点模型，调用方打点时不必再装一层 core。

export type { LngLat, MapPoint } from '@turbomap/core'
export { createOlFrameHost } from './frameHost'
export { createOlMap, OlMap, default } from './OlMap'
export type { OlMapOptions } from './OlMap'
export { pickFeatureId } from './pick'
// 调度器类型跟着入口导出，自定义任务可以直接 submit，不必单独装调度包。
// 值导出和类型导出分开，满足 verbatimModuleSyntax。
export { TaskScheduler } from '@turbomap/scheduler'
export type {
  FrameHost,
  SchedulableTask,
  TaskSchedulerOptions,
  TaskSnapshot,
  TaskStatus,
} from '@turbomap/scheduler'
export { createPointsTask } from './points'
// 输入类型跟着工厂导出，业务不用再深入任务文件。
export type { PointInput, PointsTaskOptions } from './points'

/** 为 true 时，OpenLayers 适配可以创建地图并分帧打点。 */
export const OL_ENGINE_READY = true
