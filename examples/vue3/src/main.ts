// 示例入口挂载导航。Cesium 控件样式和 TDesign 都在这里注册一次。

import { createApp } from 'vue'
import TDesign from 'tdesign-vue-next'
import App from './App.vue'
import 'tdesign-vue-next/es/style/index.css'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import 'ol/ol.css'
import './style.scss'

createApp(App).use(TDesign).mount('#app')
