// 文档站使用 VitePress 默认主题，并注册 TDesign，演示组件里可以直接写 t-button。

import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(TDesign)
  },
}

export default theme
