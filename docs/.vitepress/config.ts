import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  title: 'turbomap',
  description: 'Cesium 与 OpenLayers 的十万级打点',
  lang: 'zh-CN',
  // 开发服务器听所有网卡，局域网可以用 IP 打开文档。
  // 别名指到源码，文档里的地图演示不用先构建库。
  vite: {
    resolve: {
      alias: {
        '@turbomap/ol': source('../../packages/ol/src/index.ts'),
        '@turbomap/core': source('../../packages/core/src/index.ts'),
        '@turbomap/scheduler': source('../../packages/scheduler/src/index.ts'),
      },
    },
    server: {
      host: true,
      fs: {
        allow: [source('../..')],
      },
    },
  },
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'Cesium', link: '/cesium/getting-started' },
      { text: 'OpenLayers', link: '/ol/getting-started' },
      { text: 'API', link: '/api/scheduler' },
    ],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '介绍', link: '/guide/introduction' },
          { text: '调度器', link: '/guide/scheduler' },
          { text: '架构', link: '/architecture' },
        ],
      },
      {
        text: 'Cesium',
        items: [
          { text: '快速开始', link: '/cesium/getting-started' },
          { text: '打点', link: '/cesium/points' },
          { text: '拾取', link: '/cesium/picking' },
        ],
      },
      {
        text: 'OpenLayers',
        items: [
          { text: '快速开始', link: '/ol/getting-started' },
          { text: '打点', link: '/ol/points' },
          { text: '拾取', link: '/ol/picking' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: '调度器', link: '/api/scheduler' },
          { text: '点模型', link: '/api/core' },
          { text: 'Cesium', link: '/api/cesium' },
          { text: 'OpenLayers', link: '/api/ol' },
        ],
      },
    ],
  },
})
