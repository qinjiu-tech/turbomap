// 把调度器接到 Cesium 自己的帧上，scheduler 包因此看不到 Viewer。
// 销毁后不再回调，避免留下指向已释放场景的监听。

import * as Cesium from 'cesium'
import type { FrameHost } from '@turbomap/scheduler'

/**
 * 把调度器接到 Cesium 自己的渲染循环上。
 * preUpdate 里改图元，requestRenderMode 下由 requestFrame 决定要不要画下一帧。
 * Viewer 销毁后不再回调，避免留下悬空监听。
 */
export function createCesiumFrameHost(viewer: Cesium.Viewer): FrameHost {
  return {
    onFrame(listener: () => void): () => void {
      const remove = viewer.scene.preUpdate.addEventListener(() => {
        if (!viewer.isDestroyed()) listener()
      })
      return () => {
        if (!viewer.isDestroyed()) remove()
      }
    },
    requestFrame(): void {
      if (!viewer.isDestroyed()) viewer.scene.requestRender()
    },
  }
}
