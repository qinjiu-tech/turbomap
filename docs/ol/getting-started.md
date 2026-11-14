# 快速开始

```bash
pnpm add @turbomap/ol ol
```

`ol` 是 peer dependency，要求 `>= 9.5.0`。`@turbomap/core` 和 `@turbomap/scheduler` 会随 `@turbomap/ol` 安装。页面要引入控件样式：

```ts
import 'ol/ol.css'
```

```ts
import OlMap from '@turbomap/ol'

const map = new OlMap(container, {
  center: [108, 32],
  zoom: 4,
})

map.addPoints({
  name: '10 万点',
  count: 100_000,
  pixelSize: 3,
  pointAt: (index) => ({
    id: index,
    position: { longitude: 121.47, latitude: 31.23 },
  }),
})
```

`OlMap` 继承 `ol/Map`，默认导出就是这个类。底图是 OSM，经纬度会投影到 EPSG:3857。`map.destroy()` 先停调度器，再拆掉地图 target。点怎么画进图层见 [打点](/ol/points)，点击见 [拾取](/ol/picking)。
