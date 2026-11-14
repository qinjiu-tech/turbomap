// 调度器的公开契约。快照里只有纯数据，图元不能出现在这里。
// 取消后的任务会从列表删除，所以状态里没有 cancelled。

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

/** 可调度任务。tick 须在 deadline 前返回，完成时返回 true。cancel 只清除本任务图形。 */
export interface SchedulableTask {
  readonly id: string
  readonly name: string
  readonly type: string
  readonly progress: number
  tick(deadline: number): boolean
  /** 完成后的逐帧回调，例如更新材质时间。 */
  onFrame?(): void
  cancel(): void
  destroy(): void
}

/** 引擎帧入口。Cesium 用 preUpdate，OpenLayers 以后用 postrender。 */
export interface FrameHost {
  onFrame(listener: () => void): () => void
  requestFrame(): void
}
