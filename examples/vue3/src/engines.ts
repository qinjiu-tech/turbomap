// 示例菜单。顶部选引擎，左侧选该引擎下的功能。
// 文档页只引用单个功能组件，不要从这里把 Cesium 和 OpenLayers 一起引进去。

import type { Component } from 'vue'
import CesiumPoints from './cesium/points/PointsDemo.vue'
import OlPoints from './ol/points/PointsDemo.vue'

export interface DemoFeature {
  id: string
  title: string
  component: Component
}

export interface DemoEngine {
  id: string
  title: string
  features: DemoFeature[]
}

export const engines: DemoEngine[] = [
  {
    id: 'cesium',
    title: 'Cesium',
    features: [{ id: 'points', title: '打点', component: CesiumPoints }],
  },
  {
    id: 'ol',
    title: 'OpenLayers',
    features: [{ id: 'points', title: '打点', component: OlPoints }],
  },
]
