# OpenLayers

```ts
import OlMap, { createOlMap, pickFeatureId } from '@turbomap/ol'

const map = new OlMap(container, {
  frameBudgetMs: 6,
  center: [108, 32],
  zoom: 4,
})

map.addPoints(options)
map.cancelTask(id)
map.cancelAllTasks()
map.scheduler
map.destroy()

map.on('click', (event) => {
  pickFeatureId(map, event.pixel)
})
```

`OlMap` 继承 `ol/Map`，默认导出就是这个类。`createOlMap` 与 `new OlMap` 相同。底图是 OSM，视图是 EPSG:3857。`destroy()` 先停调度器，再 `setTarget(undefined)`。

`pickFeatureId` 返回要素上的业务 id。没有命中时返回 `undefined`。

用法见 [快速开始](/ol/getting-started)、[打点](/ol/points) 和 [拾取](/ol/picking)。
