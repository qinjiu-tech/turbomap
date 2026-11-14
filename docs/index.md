---
layout: home

hero:
  name: turbomap
  text: 可换引擎的地图库
  tagline: 调度器与引擎分开。Cesium 与 OpenLayers 都按帧预算打十万级点。
  actions:
    - theme: brand
      text: Cesium
      link: /cesium/getting-started
    - theme: alt
      text: OpenLayers
      link: /ol/getting-started

features:
  - title: 调度器不认识引擎
    details: "@turbomap/scheduler 只接收 FrameHost。Cesium 接 preUpdate，OpenLayers 接 postrender。"
  - title: 按帧预算轮询
    details: 十万级点按每帧几毫秒写入，首屏不会被一次创建卡住。
  - title: 关闭即清除
    details: 每个打点任务持有自己的点集合。取消任务会删掉已经画出来的点。
---
