// 调度器的库构建。本包没有运行时依赖，产物里不能出现 cesium 或 ol。
// 没有 css，不需要配置资源内联。

import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    // emptyOutDir 避免上次构建留下已删除的导出。
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(root, 'src/index.ts'),
      formats: ['es', 'cjs'],
      // 产物文件名固定为 index.js 和 index.cjs，对应 package exports。
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
  },
  plugins: [
    dts({
      // dts 使用本包 tsconfig，避免把别的包的源码卷进声明。
      tsconfigPath: './tsconfig.json',
      // bundleTypes 把声明收成一份，调用方不用跟着源码目录走。
      bundleTypes: true,
    }),
  ],
})
