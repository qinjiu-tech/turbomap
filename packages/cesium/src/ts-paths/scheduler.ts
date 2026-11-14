// 给本包类型检查用的调度器镜像。真正的实现在 @turbomap/scheduler。
// 停在本目录，TypeScript 6 才不会把公共源码目录算到上一级。

/** 每一帧用来推进任务的时间预算，单位毫秒。 */
export interface TaskSchedulerOptions {
  frameBudgetMs?: number
}

/** 调度器状态。取消后任务会从列表删除，所以没有 cancelled。 */
export type TaskStatus = 'pending' | 'running' | 'done' | 'failed'

/** 订阅快照。不要放入图元或引擎对象。 */
export interface TaskSnapshot {
  id: string
  name: string
  type: string
  status: TaskStatus
  /** 完成比例，范围是 0 到 1。 */
  progress: number
  error?: string
}

/** 可调度任务。tick 须在 deadline 前返回，完成时返回 true。 */
export interface SchedulableTask {
  readonly id: string
  readonly name: string
  readonly type: string
  readonly progress: number
  tick(deadline: number): boolean
  onFrame?(): void
  cancel(): void
  destroy(): void
}

/** 引擎帧入口。Cesium 用 preUpdate，OpenLayers 用 postrender。 */
export interface FrameHost {
  onFrame(listener: () => void): () => void
  requestFrame(): void
}

/** 多个任务共用一帧预算。这里只保留 cesium 包会调用的方法。 */
export declare class TaskScheduler {
  constructor(host: FrameHost, options?: TaskSchedulerOptions)
  submit(task: SchedulableTask): string
  cancel(id: string): void
  cancelAll(): void
  destroy(): void
  getTasks(): TaskSnapshot[]
  subscribe(listener: (tasks: TaskSnapshot[]) => void): () => void
}
