// 一个示例同时跑两套引擎。Cesium 的 Worker 由插件复制。
// MAP_SOURCE=0 时走已构建的 dist，用来确认发布入口。

import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'

const source = process.env.MAP_SOURCE !== '0'

export default defineConfig({
  plugins: [vue(), cesium()],
  resolve: source
    ? {
        alias: {
          '@turbomap/cesium': fileURLToPath(new URL('../../packages/cesium/src/index.ts', import.meta.url)),
          '@turbomap/ol': fileURLToPath(new URL('../../packages/ol/src/index.ts', import.meta.url)),
          '@turbomap/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
          '@turbomap/scheduler': fileURLToPath(
            new URL('../../packages/scheduler/src/index.ts', import.meta.url),
          ),
        },
      }
    : undefined,
  server: {
    host: '127.0.0.1',
    // 5173 常被文档站占用，示例固定 5174。
    port: 5174,
    fs: {
      allow: ['../..'],
    },
  },
})
