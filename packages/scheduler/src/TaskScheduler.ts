// 多个任务共用一帧的时间预算，按队列轮询，不认识任何地图引擎。
// 只有存在未完成任务或 onFrame 时才 requestFrame，避免地图空转。

import type { FrameHost, SchedulableTask, TaskSnapshot, TaskStatus } from './types'

interface TaskRecord {
  task: SchedulableTask
  status: TaskStatus
  progress: number
  error?: string
}

export interface TaskSchedulerOptions {
  /** 每一帧用来推进任务的时间预算，单位毫秒，默认 6，并夹在 1 到 32。 */
  frameBudgetMs?: number
}

/**
 * 多个任务共用一帧的时间预算，按队列轮询各做一片。
 * 这样一次十万级打点不会把后面的小任务一直堵在等待态。
 * 只有存在未完成任务或 onFrame 时才 requestFrame，避免地图空转。
 */
export class TaskScheduler {
  private readonly tasks = new Map<string, TaskRecord>()
  // order 是提交顺序，完成的任务也留在里面，直到取消。
  private order: string[] = []
  // cursor 可以走到末尾再回到 0，这是轮询而不是优先队列。
  private cursor = 0
  // activeCount 用来跳过“队列里全是已完成任务”的空转。
  private activeCount = 0
  // listeners 用 Set，同一个函数重复订阅不会收到两次。
  private readonly listeners = new Set<(tasks: TaskSnapshot[]) => void>()
  private readonly frameBudgetMs: number
  private readonly removeFrame: () => void
  private rafId = 0
  private disposed = false

  constructor(
    private readonly host: FrameHost,
    options?: TaskSchedulerOptions,
  ) {
    const budget = options?.frameBudgetMs ?? 6
    // frameBudgetMs 在构造时夹紧，之后不再读取选项对象。
    this.frameBudgetMs = Math.min(32, Math.max(1, budget))
    // host.onFrame 在地图帧里做 tick。如果只靠 preUpdate，按需渲染下没有绘制就不会再进帧，任务会卡住。
    this.removeFrame = host.onFrame(() => {
      this.frame()
    })
  }

  /**
   * 提交任务并立刻请求一帧。
   * 同一 id 重复提交抛错，避免两份图形只取消一次。调度器已销毁时抛错。
   */
  submit(task: SchedulableTask): string {
    if (this.disposed) throw new Error('TaskScheduler 已销毁')
    if (this.tasks.has(task.id)) throw new Error(`任务已存在: ${task.id}`)

    this.tasks.set(task.id, {
      task,
      status: 'pending',
      progress: task.progress,
    })
    this.order.push(task.id)
    this.activeCount += 1
    this.emit()
    // submit 后立刻 kick，不等到下一次地图交互才开始第一帧。
    this.kick()
    this.host.requestFrame()
    return task.id
  }

  /** 取消一个任务并清掉它自己的图形。id 不存在或调度器已销毁时忽略。 */
  cancel(id: string): void {
    const record = this.tasks.get(id)
    if (!this.disposed && record) this.removeRecord(record, true)
  }

  /** 取消全部任务。先复制 key，避免边遍历 Map 边删除。 */
  cancelAll(): void {
    for (const id of [...this.tasks.keys()]) this.cancel(id)
  }

  /** 返回当前快照的副本，调用方可以保存下来做对比。 */
  getTasks(): TaskSnapshot[] {
    return this.snapshot()
  }

  /** 订阅后会立刻推送当前快照，返回值用来取消订阅。 */
  subscribe(listener: (tasks: TaskSnapshot[]) => void): () => void {
    this.listeners.add(listener)
    listener(this.snapshot())
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * 停掉帧循环并销毁全部任务。
   * 可以重复调用。disposed 设在最前，帧回调再进来会直接返回。
   */
  destroy(): void {
    if (this.disposed) return
    this.disposed = true
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = 0
    this.removeFrame()
    for (const record of this.tasks.values()) {
      record.task.cancel()
      record.task.destroy()
    }
    this.tasks.clear()
    this.order = []
    this.activeCount = 0
    this.listeners.clear()
  }

  /**
   * 取消并销毁一条记录。
   * notify 为真时推送快照并请求一帧。已完成任务不减少 activeCount。
   */
  private removeRecord(record: TaskRecord, notify: boolean): void {
    const active = record.status === 'pending' || record.status === 'running'
    record.task.cancel()
    record.task.destroy()
    this.tasks.delete(record.task.id)
    this.removeFromOrder(record.task.id)
    if (active) this.activeCount = Math.max(0, this.activeCount - 1)
    if (notify) {
      this.emit()
      this.host.requestFrame()
    }
  }

  /** 删除队列项时修正游标，避免轮询跳过下一个任务或越界。 */
  private removeFromOrder(id: string): void {
    const index = this.order.indexOf(id)
    if (index < 0) return
    this.order.splice(index, 1)
    if (this.cursor > index) this.cursor -= 1
    if (this.cursor >= this.order.length) this.cursor = 0
  }

  private frame(): void {
    if (this.disposed) return

    let animated = false
    // 动画帧和推进帧可以发生在同一次 onFrame 里，先动画再 tick。
    for (const record of this.tasks.values()) {
      if (record.status === 'done' && record.task.onFrame) {
        record.task.onFrame()
        animated = true
      }
    }

    let worked = false
    if (this.activeCount > 0) {
      const deadline = performance.now() + this.frameBudgetMs
      let idle = 0
      // idle 走到队列长度就说明这一圈没有可执行任务，避免在已完成任务上转圈。
      while (performance.now() < deadline && idle < this.order.length && this.order.length > 0) {
        if (this.cursor >= this.order.length) this.cursor = 0
        const id = this.order[this.cursor]
        if (!id) break
        this.cursor += 1
        const record = this.tasks.get(id)
        if (!record || (record.status !== 'pending' && record.status !== 'running')) {
          idle += 1
          continue
        }

        idle = 0
        // running 在真正调用 tick 之前写入，面板能看到进行中。
        record.status = 'running'
        try {
          const finished = record.task.tick(deadline)
          // 进度以任务自己的 progress 为准，调度器不猜测完成了多少。
          record.progress = record.task.progress
          worked = true
          if (finished) {
            record.status = 'done'
            // finished 后进度强制为 1，避免任务自己的进度停在 0.99。
            record.progress = 1
            this.activeCount = Math.max(0, this.activeCount - 1)
          }
        } catch (error) {
          // 失败仍 destroy，图形和状态不会一个在场景里一个在面板上。失败任务留在列表里，关闭时再走 cancel。
          record.status = 'failed'
          record.progress = record.task.progress
          record.error = error instanceof Error ? error.message : String(error)
          record.task.destroy()
          this.activeCount = Math.max(0, this.activeCount - 1)
          worked = true
        }
      }
    }

    // 工作帧才 emit。纯动画帧只 requestFrame，不迫使面板每个动画帧重绘。
    if (worked) this.emit()
    if (worked || animated) this.host.requestFrame()
  }

  /** 有进行中的任务，或已完成但仍要 onFrame 的任务，才需要下一帧。 */
  private needsFrame(): boolean {
    if (this.activeCount > 0) return true
    for (const record of this.tasks.values()) {
      if (record.status === 'done' && record.task.onFrame) return true
    }
    return false
  }

  private kick(): void {
    if (this.disposed || this.rafId) return
    this.rafId = requestAnimationFrame(this.pump)
  }

  private pump = (): void => {
    if (this.disposed) return
    // needsFrame 为假时 pump 把自己停掉，下一次 submit 会重新 kick。
    if (!this.needsFrame()) {
      this.rafId = 0
      return
    }
    this.host.requestFrame()
    // requestFrame 不保证本帧立即重入，rAF 只负责在有工作时把下一帧要回来。
    this.rafId = requestAnimationFrame(this.pump)
  }

  private snapshot(): TaskSnapshot[] {
    const list: TaskSnapshot[] = []
    for (const id of this.order) {
      const record = this.tasks.get(id)
      // 跳过队列里已经删掉的 id，防御游标和 Map 短暂不一致。
      if (!record) continue
      list.push({
        id: record.task.id,
        name: record.task.name,
        type: record.task.type,
        status: record.status,
        progress: record.status === 'done' ? 1 : record.progress,
        error: record.error,
      })
    }
    return list
  }

  private emit(): void {
    // 没有监听者时不克隆快照。订阅者拿到的是副本，任务对象本身不交给 Vue。
    if (this.listeners.size === 0) return
    const tasks = this.snapshot()
    for (const listener of this.listeners) listener(tasks)
  }
}
