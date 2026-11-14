// Cesium 适配的库构建。cesium 和调度器保持 external，版本由使用方决定。
// 声明从本包 tsconfig 生成，路径别名只用于类型检查，不会写进产物的 import。

import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    // emptyOutDir 避免上次构建留下已删除的导出。
    emptyOutDir: true,
    // sourcemap 打开，业务里报错能回到这里的 TypeScript。
    sourcemap: true,
    lib: {
      entry: resolve(root, 'src/index.ts'),
      // 同时产出 esm 和 cjs，类型入口只有一份 rollup 后的 d.ts。
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      // 库构建不把 cesium 和调度器打进去。
      external: [/^cesium($|\/)/, '@turbomap/core', '@turbomap/scheduler'],
    },
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.json',
      // bundleTypes 把声明收成一份，调用方不用跟着源码目录走。
      bundleTypes: true,
    }),
  ],
})
