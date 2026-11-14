<script setup lang="ts">
// 顶部切引擎，左侧切功能。功能组件自己创建地图，切换时整块卸掉。

import { computed, ref } from 'vue'
import { engines } from './engines'

const engineId = ref(engines[0]?.id ?? '')
const featureId = ref(engines[0]?.features[0]?.id ?? '')

const engine = computed(() => engines.find((item) => item.id === engineId.value) ?? engines[0])
const feature = computed(
  () => engine.value?.features.find((item) => item.id === featureId.value) ?? engine.value?.features[0],
)

function selectEngine(value: string): void {
  engineId.value = value
  featureId.value = engines.find((item) => item.id === value)?.features[0]?.id ?? ''
}
</script>

<template>
  <div class="shell">
    <header class="shell__top">
      <strong>turbomap</strong>
      <t-head-menu :value="engineId" theme="light" @change="selectEngine">
        <t-menu-item v-for="item in engines" :key="item.id" :value="item.id">{{ item.title }}</t-menu-item>
      </t-head-menu>
    </header>
    <div class="shell__body">
      <aside class="shell__nav">
        <t-menu v-model="featureId" theme="light" width="100%">
          <t-menu-item v-for="item in engine?.features ?? []" :key="item.id" :value="item.id">
            {{ item.title }}
          </t-menu-item>
        </t-menu>
      </aside>
      <main class="shell__stage">
        <component :is="feature.component" v-if="feature" :key="`${engineId}-${feature.id}`" />
      </main>
    </div>
  </div>
</template>
