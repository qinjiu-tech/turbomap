// 点任务独占一份 PointPrimitiveCollection，取消时只删这一份。
// 不用 Entity，是为了十万级点不走属性系统。

import * as Cesium from 'cesium'
import type { MapPoint } from '@turbomap/core'
import { colorFromCss, POINT_COLOR } from '../color'
import { toCartesian } from '../coordinates'
import { createId } from '../id'
import type { SchedulableTask } from '@turbomap/scheduler'

export type PointInput = MapPoint

export interface PointsTaskOptions {
  id?: string
  name?: string
  /** 已经准备好的点。与 pointAt 同时存在时使用 points。 */
  points?: readonly PointInput[]
  /** 按索引生成点。大规模打点时用它，避免先分配一整份数组。 */
  pointAt?: (index: number) => PointInput
  /** pointAt 的点数量。 */
  count?: number
  color?: string
  pixelSize?: number
}

// 每 400 个点才看一次时钟，避免时间检查本身变成热点。
const CHECK_EVERY = 400

/**
 * 按时间预算把点写入一份 PointPrimitiveCollection。
 * points 与 pointAt 同时存在时只用 points；两者都缺或数量非法时抛错。
 * 单点可以覆盖颜色、大小和 id，缺省时用任务级颜色、大小和任务 id。
 * 取消和销毁都只移除这一份集合；总数为 0 时不创建集合。
 */
export function createPointsTask(
  viewer: Cesium.Viewer,
  options: PointsTaskOptions,
): SchedulableTask {
  const points = options.points
  const pointAt = points ? undefined : options.pointAt
  const total = points?.length ?? (pointAt ? options.count : undefined)
  if (total == null || total < 0 || (pointAt == null && points == null)) {
    throw new Error('addPoints 需要 points，或 pointAt 与 count')
  }

  const id = options.id ?? createId('points')
  const name = options.name ?? '打点'
  const fallbackColor = colorFromCss(options.color, POINT_COLOR)
  const fallbackSize = options.pixelSize ?? 6
  let collection: Cesium.PointPrimitiveCollection | undefined
  let index = 0
  let progress = total === 0 ? 1 : 0
  let cancelled = false
  let removed = false

  // pointOf 在两种数据源之间切换，调用方不会同时走两条路径。
  function pointOf(pointIndex: number): PointInput {
    const point = points ? points[pointIndex] : pointAt?.(pointIndex)
    if (!point) throw new Error(`点不存在: ${pointIndex}`)
    return point
  }

  function ensureCollection(): Cesium.PointPrimitiveCollection {
    if (collection) return collection
    // BlendOption.OPAQUE 要求颜色不透明。当前默认色没有 alpha，半透明时要同步改混合模式。
    collection = viewer.scene.primitives.add(
      new Cesium.PointPrimitiveCollection({
        blendOption: Cesium.BlendOption.OPAQUE,
      }),
    )
    return collection
  }

  // removeGraphics 可重复调用，调度器会先后执行 cancel 和 destroy。
  function removeGraphics(): void {
    if (removed) return
    removed = true
    // Viewer 已销毁时不再 remove，避免销毁顺序颠倒时抛异常。
    if (collection && !viewer.isDestroyed()) viewer.scene.primitives.remove(collection)
    collection = undefined
  }

  return {
    id,
    name,
    type: 'points',
    get progress() {
      return progress
    },
    tick(deadline: number) {
      if (cancelled || total === 0) return true
      // 集合创建放在第一次 tick，取消发生在第一帧之前时场景里不会留下空集合。
      const target = ensureCollection()
      while (index < total && performance.now() < deadline) {
        const end = Math.min(index + CHECK_EVERY, total)
        // 内层循环不查 deadline，400 个点的上限用来控制单次超支。
        for (; index < end; index += 1) {
          const point = pointOf(index)
          target.add({
            position: toCartesian(point.position),
            pixelSize: point.pixelSize ?? fallbackSize,
            color: colorFromCss(point.color, fallbackColor),
            id: point.id ?? id,
          })
        }
      }
      // progress 用已写入数量除以总数，不做平滑。
      progress = index / total
      return index >= total
    },
    cancel() {
      cancelled = true
      // 取消和销毁走同一份移除，避免两条路径各自留一半图形。
      removeGraphics()
    },
    // destroy 不改 cancelled。调度器在失败路径上也会调用它，只负责清图形。
    destroy: removeGraphics,
  }
}
