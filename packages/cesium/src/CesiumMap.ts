// Cesium 引擎门面：自己创建 Viewer，再把帧循环适配成 FrameHost。
// 调度器因此不必知道 Viewer。销毁时先停任务，再销毁 Viewer。

import * as Cesium from 'cesium'
import { TaskScheduler } from '@turbomap/scheduler'
import { createCesiumFrameHost } from './frameHost'
import { createPointsTask, type PointsTaskOptions } from './tasks/points'

export interface CesiumMapOptions {
  /** 每帧任务时间预算，单位毫秒，默认 6。 */
  frameBudgetMs?: number
  /** 传给 Cesium ion。不传则使用自带的 OSM 底图，不依赖 token。 */
  ionAccessToken?: string
  /** 覆盖 Viewer 构造参数。后写的字段会盖过默认值。 */
  viewer?: Cesium.Viewer.ConstructorOptions
}

/**
 * 默认关掉大部分控件，并打开按需渲染。
 * 底图用 OSM，这样没有 ion token 时也能看到地球。
 * 深度检测关掉，高度为 0 的点才不会被椭球面裁掉。
 */
function createViewer(container: HTMLElement, options?: CesiumMapOptions): Cesium.Viewer {
  if (options?.ionAccessToken) Cesium.Ion.defaultAccessToken = options.ionAccessToken

  const viewer = new Cesium.Viewer(container, {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    requestRenderMode: true,
    // maximumRenderTimeChange 设成无穷大，时钟走动本身不会触发重绘。
    maximumRenderTimeChange: Number.POSITIVE_INFINITY,
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    baseLayer: new Cesium.ImageryLayer(
      new Cesium.UrlTemplateImageryProvider({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        maximumLevel: 19,
        credit: '© OpenStreetMap contributors',
      }),
    ),
    // 用户传入的 viewer 选项放在最后，用来覆盖这些默认值。
    ...options?.viewer,
  })
  // depthTestAgainstTerrain 关掉后，高度为 0 的点不会被地表裁掉。
  if (viewer.scene.globe) viewer.scene.globe.depthTestAgainstTerrain = false
  return viewer
}

/** Cesium 引擎入口。调度器只拿到 FrameHost，不把 Viewer 类型漏进 scheduler 包。 */
export class CesiumMap {
  readonly viewer: Cesium.Viewer
  readonly scheduler: TaskScheduler
  private disposed = false

  constructor(container: HTMLElement, options?: CesiumMapOptions) {
    this.viewer = createViewer(container, options)
    this.scheduler = new TaskScheduler(createCesiumFrameHost(this.viewer), {
      frameBudgetMs: options?.frameBudgetMs,
    })
  }

  /** 提交打点任务。销毁后抛错。点数据用 MapPoint，缺省颜色和大小由任务补上。 */
  addPoints(options: PointsTaskOptions): string {
    this.assertAlive()
    return this.scheduler.submit(createPointsTask(this.viewer, options))
  }

  /** 取消一个任务并清掉它的点集合。已销毁时忽略。 */
  cancelTask(id: string): void {
    if (!this.disposed) this.scheduler.cancel(id)
  }

  /** 取消全部打点任务。已销毁时忽略。 */
  cancelAllTasks(): void {
    if (!this.disposed) this.scheduler.cancelAll()
  }

  /** 先停调度，再销毁 Viewer，避免回调还在访问已销毁场景。 */
  destroy(): void {
    if (this.disposed) return
    this.disposed = true
    this.scheduler.destroy()
    if (!this.viewer.isDestroyed()) this.viewer.destroy()
  }

  // addPoints 在销毁后抛错，避免把任务提交到已经拆掉的调度器。
  private assertAlive(): void {
    if (this.disposed) throw new Error('CesiumMap 已销毁')
  }
}

export function createCesiumMap(container: HTMLElement, options?: CesiumMapOptions): CesiumMap {
  return new CesiumMap(container, options)
}
