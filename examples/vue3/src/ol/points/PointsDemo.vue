<script setup lang="ts">
// OpenLayers 打点。文档页直接引用本文件，所以地图在挂载后再创建。

import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import type OlMap from '@turbomap/ol'
import type { MapPoint } from '@turbomap/core'
import FullscreenButton from '../../shared/FullscreenButton.vue'
import { useFullscreen } from '../../shared/useFullscreen'
import 'ol/ol.css'

const root = ref<HTMLElement | null>(null)
const container = ref<HTMLElement | null>(null)
const api = shallowRef<OlMap | null>(null)
const ready = ref(false)
const message = ref('点击地图上的点')
let alive = true

const { fullscreen, expanded, toggleFullscreen } = useFullscreen(root, () => api.value?.updateSize())

/** 按序号铺到中国范围。分布稳定，刷新后同一序号还在原处。 */
function pointAt(index: number): MapPoint {
  const longitude = 73 + ((index * 17) % 6200) / 100
  const latitude = 18 + ((index * 13) % 3600) / 100
  return { id: index, position: { longitude, latitude } }
}

/** 按数量打点。超过 5 万个点时把圆改小，避免叠成色块。 */
function addPoints(count: number): void {
  api.value?.addPoints({
    name: `${count.toLocaleString('zh-CN')} 个点`,
    count,
    pixelSize: count > 50_000 ? 3 : 6,
    pointAt,
  })
}

onMounted(async () => {
  const { default: Map, pickFeatureId } = await import('@turbomap/ol')
  if (!alive || !container.value) return
  const instance = new Map(container.value)
  api.value = instance
  ready.value = true
  instance.on('click', (event) => {
    const id = pickFeatureId(instance, event.pixel)
    message.value = id == null ? '未拾取到对象' : `拾取到 ${String(id)}`
  })
})

onBeforeUnmount(() => {
  alive = false
  api.value?.destroy()
})
</script>

<template>
  <div ref="root" class="points-demo" :class="{ 'points-demo--expanded': expanded }">
    <div ref="container" class="points-demo__map" />
    <FullscreenButton :active="fullscreen || expanded" @toggle="toggleFullscreen" />
    <section class="points-demo__dock">
      <h2>打点</h2>
      <p>按帧预算把点写进 WebGL 点图层。</p>
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
      margin: 8px 0 0;
      color: #475569;
      font-size: 13px;
      line-height: 1.5;
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 12px;

    :last-child {
      grid-column: 1 / -1;
    }
  }

  &__picked {
    margin-top: 12px;
  }
}
</style>
