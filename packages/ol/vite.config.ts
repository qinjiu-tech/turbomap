// OpenLayers 适配的库构建。ol、core 和调度器保持 external，版本由使用方决定。
// 声明从本包 tsconfig 生成，路径别名只用于类型检查。

import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    // emptyOutDir 避免上次构建留下已删除的导出。
    emptyOutDir: true,
    // sourcemap 保留，抛错栈能对应到 createOlMap。
    sourcemap: true,
    lib: {
      entry: resolve(root, 'src/index.ts'),
      formats: ['es', 'cjs'],
      // 文件名和 Cesium 包对齐，发布脚本不用为这个包单独分支。
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      // 库构建不把 ol、点模型和调度器打进去。
      external: ['@turbomap/core', '@turbomap/scheduler', /^ol($|\/)/],
    },
  },
  plugins: [
    dts({
      // 声明生成方式和 Cesium 包一致，以后补实现时不用改构建。
      tsconfigPath: './tsconfig.json',
      bundleTypes: true,
    }),
  ],
})
