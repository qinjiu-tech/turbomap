<script setup lang="ts">
// Cesium 打点。离开菜单时清掉 Viewer。
// 文档站不要直接引用本文件，构建期不能加载 Cesium。

import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import * as Cesium from 'cesium'
import { createCesiumMap, type CesiumMap } from '@turbomap/cesium'
import FullscreenButton from '../../shared/FullscreenButton.vue'
import { useFullscreen } from '../../shared/useFullscreen'
import { pointAt } from '../demo-data'

const root = ref<HTMLElement | null>(null)
const container = ref<HTMLElement | null>(null)
const api = shallowRef<CesiumMap | null>(null)
const ready = ref(false)
const message = ref('点击地图上的点')
let pickHandler: Cesium.ScreenSpaceEventHandler | undefined

const { fullscreen, expanded, toggleFullscreen } = useFullscreen(root, () => {
  const viewer = api.value?.viewer
  if (viewer && !viewer.isDestroyed()) viewer.resize()
})

/** 按数量打点。超过 5 万个点时把点改小，避免圆点糊成一片。 */
function addPoints(count: number): void {
  api.value?.addPoints({
    name: `${count.toLocaleString('zh-CN')} 个点`,
    count,
    pixelSize: count > 50_000 ? 3 : 6,
    pointAt,
  })
  api.value?.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(104, 36, count > 50_000 ? 8_200_000 : 7_200_000),
    duration: 1.1,
  })
}

onMounted(() => {
  if (!container.value) return
  try {
    const instance = createCesiumMap(container.value)
    api.value = instance
    ready.value = true
    instance.viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(108, 32, 6_500_000),
    })
    pickHandler = new Cesium.ScreenSpaceEventHandler(instance.viewer.scene.canvas)
    pickHandler.setInputAction((event: { position: Cesium.Cartesian2 }) => {
      const picked = instance.viewer.scene.pick(event.position) as { id?: unknown } | undefined
      message.value = picked?.id == null ? '未拾取到对象' : `拾取到 ${String(picked.id)}`
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Viewer 创建失败'
  }
})

onBeforeUnmount(() => {
  pickHandler?.destroy()
  api.value?.destroy()
})
</script>

<template>
  <div ref="root" class="points-demo" :class="{ 'points-demo--expanded': expanded }">
    <div ref="container" class="points-demo__map" />
    <FullscreenButton :active="fullscreen || expanded" @toggle="toggleFullscreen" />
    <section class="points-demo__dock">
      <h2>打点</h2>
      <p>按帧预算把点写进 PointPrimitiveCollection。</p>
      <div class="points-demo__actions">
        <t-button theme="primary" :disabled="!ready" @click="addPoints(20_000)">2 万点</t-button>
        <t-button theme="primary" :disabled="!ready" @click="addPoints(100_000)">10 万点</t-button>
        <t-button theme="default" variant="outline" block :disabled="!ready" @click="api?.cancelAllTasks()">
          取消全部
        </t-button>
      </div>
      <t-alert class="points-demo__picked" theme="info" :message="message" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.points-demo {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  background: #020617;

  &:fullscreen,
  &--expanded {
    position: fixed;
    inset: 0;
    z-index: 2000;
    width: 100%;
    height: 100%;
  }

  &__map {
    width: 100%;
    height: 100%;
  }

  &__dock {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 2;
    width: min(320px, calc(100% - 32px));
    padding: 16px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.94);
    color: #0f172a;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);

    h2 {
      margin: 0;
      font-size: 18px;
    }

    p {
      margin: 6px 0 0;
      color: #475569;
      font-size: 12px;
      line-height: 1.5;
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 14px;

    :last-child {
      grid-column: 1 / -1;
    }
  }

  &__picked {
    margin-top: 12px;
  }
}
</style>
