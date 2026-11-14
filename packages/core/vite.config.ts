// 公共模型的库构建。这个包没有运行时依赖，产物里不能出现 cesium 或 ol。
// 不依赖调度器，调用方可以只拿坐标类型。

import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    // emptyOutDir 避免上次构建留下已删除的导出。
    emptyOutDir: true,
    // sourcemap 打开，点位类型报错能回到这里的源码。
    sourcemap: true,
    lib: {
      entry: resolve(root, 'src/index.ts'),
      formats: ['es', 'cjs'],
      // 文件名固定，对应 package exports。
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
  },
  plugins: [
    dts({
      // 只用本包 tsconfig，避免把引擎包的源码卷进声明。
      tsconfigPath: './tsconfig.json',
      bundleTypes: true,
    }),
  ],
})
