// 一个打点任务独占一份 WebGL 矢量图层，取消时只删这一份。
// 要素按批写入。逐个 addFeature 会让图层每个点都重建一次 GPU 缓冲。

import Feature from 'ol/Feature'
import type Map from 'ol/Map'
import Point from 'ol/geom/Point'
import WebGLVectorLayer from 'ol/layer/WebGLVector'
import { fromLonLat } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import type { MapPoint } from '@turbomap/core'
import type { SchedulableTask } from '@turbomap/scheduler'
import { createId } from './id'

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

const DEFAULT_COLOR = '#38bdf8'
// 每 1000 个点才提交一次 source。批次太小会让 WebGL 缓冲反复重建。
const CHECK_EVERY = 1000

/**
 * 按时间预算把点写入一份 WebGLVector 图层。
 * points 与 pointAt 同时存在时只用 points；两者都缺或数量非法时抛错。
 * 单点可以覆盖颜色、大小和 id。取消和销毁都只移除这一份图层。
 */
export function createPointsTask(map: Map, options: PointsTaskOptions): SchedulableTask {
  const points = options.points
  const pointAt = points ? undefined : options.pointAt
  const total = points?.length ?? (pointAt ? options.count : undefined)
  if (total == null || total < 0 || (pointAt == null && points == null)) {
    throw new Error('addPoints 需要 points，或 pointAt 与 count')
  }

  const id = options.id ?? createId('points')
  const name = options.name ?? '打点'
  const fallbackColor = options.color ?? DEFAULT_COLOR
  const fallbackSize = options.pixelSize ?? 6
  let source: VectorSource | undefined
  let layer: WebGLVectorLayer | undefined
  let index = 0
  let progress = total === 0 ? 1 : 0
  let cancelled = false
  let removed = false

  function pointOf(pointIndex: number): PointInput {
    // points 与 pointAt 不会同时走。缺项说明调用方数据和 count 不一致。
    const point = points ? points[pointIndex] : pointAt?.(pointIndex)
    if (!point) throw new Error(`点不存在: ${pointIndex}`)
    return point
  }

  function ensureLayer(): VectorSource {
    if (source && layer) return source
    source = new VectorSource({ wrapX: false })
    // OL 10 里 WebGLPointsLayer 已弃用。WebGLVector 仍是 GPU 批量画点，并支持按属性取色。
    layer = new WebGLVectorLayer({
      source,
      disableHitDetection: false,
      style: {
        'circle-radius': ['get', 'size'],
        'circle-fill-color': ['get', 'color'],
        'circle-opacity': 0.95,
      },
    })
    map.addLayer(layer)
    return source
  }

  // removeGraphics 可重复调用，调度器会先后执行 cancel 和 destroy。
  function removeGraphics(): void {
    if (removed) return
    removed = true
    if (layer && map.getTarget()) {
      map.removeLayer(layer)
      // dispose 释放 WebGL 上下文。只 removeLayer 时上下文还会留着。
      layer.dispose()
    }
    source?.dispose()
    layer = undefined
    source = undefined
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
      // 图层放到第一次 tick。取消发生在第一帧之前时，地图上不会留下空图层。
      const target = ensureLayer()
      while (index < total && performance.now() < deadline) {
        const end = Math.min(index + CHECK_EVERY, total)
        const batch: Feature<Point>[] = []
        for (; index < end; index += 1) {
          const point = pointOf(index)
          const feature = new Feature({
            // 视图是 3857，经纬度要先投影，否则点会堆在非洲几内亚湾附近。
            geometry: new Point(fromLonLat([point.position.longitude, point.position.latitude])),
            size: point.pixelSize ?? fallbackSize,
            color: point.color ?? fallbackColor,
          })
          // setId 留给点击拾取。样式不读这个字段。
          feature.setId(point.id ?? id)
          batch.push(feature)
        }
        // 一批只触发一次 source 变更，避免每个点都重建 WebGL 缓冲。
        if (batch.length > 0) target.addFeatures(batch)
      }
      // 进度按已提交数量，不做平滑。一批没写完时停在当前比例。
      progress = index / total
      return index >= total
    },
    cancel() {
      cancelled = true
      removeGraphics()
    },
    // destroy 不改 cancelled。调度器在失败路径上也会调用它，只负责清图层。
    destroy: removeGraphics,
  }
}
