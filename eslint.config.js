import { globalIgnores } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

const engineBoundary = (group, message) => ({
  'no-restricted-imports': [
    'error',
    {
      patterns: [{ group, message }],
    },
  ],
})

export default defineConfigWithVueTs(
  globalIgnores([
    '**/dist/**',
    '**/node_modules/**',
    'docs/.vitepress/cache/**',
    'docs/.vitepress/dist/**',
  ]),
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    rules: {
      // 可选 props 把 undefined 交给 Cesium，表示沿用引擎默认值，不在组件里填空字符串。
      'vue/require-default-prop': 'off',
    },
  },
  {
    files: ['packages/scheduler/**/*.{ts,vue}'],
    rules: engineBoundary(
      [
        'cesium',
        'cesium/*',
        'ol',
        'ol/*',
        'vue',
        'vue/*',
        '@turbomap/core',
        '@turbomap/cesium',
        '@turbomap/ol',
      ],
      '调度器只依赖 FrameHost，不能引入引擎、Vue 或点位模型包。',
    ),
  },
  {
    files: ['packages/core/**/*.{ts,vue}'],
    rules: engineBoundary(
      [
        'cesium',
        'cesium/*',
        'ol',
        'ol/*',
        'vue',
        'vue/*',
        '@turbomap/scheduler',
        '@turbomap/cesium',
        '@turbomap/ol',
      ],
      '点位模型不能引入引擎、Vue 或调度器。',
    ),
  },
  {
    files: ['packages/cesium/**/*.{ts,vue}'],
    rules: engineBoundary(
      ['ol', 'ol/*', 'vue', 'vue/*', '@turbomap/ol'],
      'Cesium 适配不能引入 OpenLayers 或 Vue。',
    ),
  },
  {
    files: ['packages/ol/**/*.{ts,vue}'],
    rules: engineBoundary(
      ['cesium', 'cesium/*', 'vue', 'vue/*', '@turbomap/cesium'],
      'OpenLayers 适配不能引入 Cesium 或 Vue。',
    ),
  },
  skipFormatting,
)
