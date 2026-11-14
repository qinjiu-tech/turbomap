// 把调度器接到 OpenLayers 的渲染循环上，scheduler 包因此看不到 Map。
// 地图拆掉 target 后不再回调，避免留下指向已释放画布的监听。

import type Map from 'ol/Map'
import type { FrameHost } from '@turbomap/scheduler'

/**
 * 把调度器接到 OpenLayers 自己的渲染循环上。
 * postrender 里追加要素，map.render 决定要不要再画一帧。
 * target 被拆掉后不再回调。
 */
export function createOlFrameHost(map: Map): FrameHost {
  return {
    onFrame(listener: () => void): () => void {
      const onPostRender = () => {
        if (map.getTarget()) listener()
      }
      map.on('postrender', onPostRender)
      return () => {
        map.un('postrender', onPostRender)
      }
    },
    requestFrame(): void {
      // render 在正在绘制时只会预约下一帧，不会在 postrender 里同步重入。
      if (map.getTarget()) map.render()
    },
  }
}
