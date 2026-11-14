// 功能块共用的全屏。浏览器允许时进入系统全屏，否则铺满窗口。

import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export function useFullscreen(root: Ref<HTMLElement | null>, onResize?: () => void) {
  const fullscreen = ref(false)
  const expanded = ref(false)

  function syncSize(): void {
    fullscreen.value = document.fullscreenElement === root.value
    requestAnimationFrame(() => onResize?.())
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !expanded.value) return
    expanded.value = false
    syncSize()
  }

  async function toggleFullscreen(): Promise<void> {
    const element = root.value
    if (!element) return
    if (document.fullscreenElement === element || expanded.value) {
      if (document.fullscreenElement === element) await document.exitFullscreen().catch(() => undefined)
      expanded.value = false
      syncSize()
      return
    }
    // 有的环境里 requestFullscreen 既不成功也不拒绝，不能一直等。
    const entered = element.requestFullscreen().then(() => true).catch(() => false)
    const settled = await Promise.race([
      entered,
      new Promise<boolean>((resolve) => {
        window.setTimeout(() => resolve(false), 300)
      }),
    ])
    if (!settled && document.fullscreenElement !== element) {
      expanded.value = true
      syncSize()
    }
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', syncSize)
    document.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', syncSize)
    document.removeEventListener('keydown', onKeydown)
  })

  return { fullscreen, expanded, toggleFullscreen }
}
