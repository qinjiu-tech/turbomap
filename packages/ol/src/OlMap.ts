// OpenLayers 地图本身。调度器挂在这个实例上，调用方不用再拿一层 map。
// 销毁时先停任务，再拆 target，避免回调还在访问已经卸掉的画布。

import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import { fromLonLat } from 'ol/proj'
import OSM from 'ol/source/OSM'
import { TaskScheduler } from '@turbomap/scheduler'
import { createOlFrameHost } from './frameHost'
import { createPointsTask, type PointsTaskOptions } from './points'

export interface OlMapOptions {
  /** 每帧任务时间预算，单位毫秒，默认 6。 */
  frameBudgetMs?: number
  /** 初始中心，经纬度。缺省看向中国中部。 */
  center?: [number, number]
  /** 初始缩放。缺省能看到全国点云。 */
  zoom?: number
}

/** 继承 Map，原生方法和调度器在同一个对象上。 */
export class OlMap extends Map {
  readonly scheduler: TaskScheduler
  // 不用 disposed。OL 的 Map 自己已经有这个字段，子类再声明会和基类撞名。
  private tornDown = false

  constructor(target: HTMLElement, options?: OlMapOptions) {
    const center = options?.center ?? [108, 32]
    // 底图和 3857 视图放在子类里，调用方不用自己拼 OL 的构造参数。
    super({
      target,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: fromLonLat(center),
        zoom: options?.zoom ?? 4,
      }),
    })
    this.scheduler = new TaskScheduler(createOlFrameHost(this), {
      frameBudgetMs: options?.frameBudgetMs,
    })
  }

  /** 提交打点任务。销毁后抛错。点数据用 MapPoint，缺省颜色和大小由任务补上。 */
  addPoints(options: PointsTaskOptions): string {
    if (this.tornDown) throw new Error('OlMap 已销毁')
    return this.scheduler.submit(createPointsTask(this, options))
  }

  /** 取消一个任务并清掉它的点图层。已销毁时忽略。 */
  cancelTask(id: string): void {
    if (!this.tornDown) this.scheduler.cancel(id)
  }

  /** 取消全部打点任务。已销毁时忽略。 */
  cancelAllTasks(): void {
    if (!this.tornDown) this.scheduler.cancelAll()
  }

  /** 先停调度，再拆 target。不要只调用 setTarget，否则任务图层还留着。 */
  destroy(): void {
    if (this.tornDown) return
    this.tornDown = true
    this.scheduler.destroy()
    this.setTarget(undefined)
  }
}

export function createOlMap(target: HTMLElement, options?: OlMapOptions): OlMap {
  return new OlMap(target, options)
}

export default OlMap
