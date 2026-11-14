# 介绍

turbomap 把「什么时候画」和「用哪套引擎画」拆开。

- `@turbomap/scheduler` 只接收 `FrameHost`。它不知道 Cesium，也不知道 OpenLayers。
- `@turbomap/core` 只有经纬度和 `MapPoint`。
- `@turbomap/cesium` 创建 Viewer，按帧预算把点写入 `PointPrimitiveCollection`。
- `@turbomap/ol` 的 `OlMap` 继承 `ol/Map`，按帧预算把点写入 `WebGLVector`。

两套引擎的打点参数相同。安装和拾取各自独立，看 [Cesium](/cesium/getting-started) 或 [OpenLayers](/ol/getting-started)。仓库不发布 Vue 组件。本地示例是 `examples/vue3`，顶部切换引擎，左侧切换功能。
