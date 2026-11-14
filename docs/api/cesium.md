# Cesium

```ts
import { createCesiumMap, pickObjectId } from '@turbomap/cesium'

const api = createCesiumMap(container, {
  frameBudgetMs: 6,
  ionAccessToken: '',
  viewer: {},
})

api.addPoints(options)
api.cancelTask(id)
api.cancelAllTasks()
api.scheduler
api.viewer
api.destroy()

pickObjectId(api.viewer, windowPosition)
```

`CesiumMap` 自己持有 `viewer`。默认底图是 OpenStreetMap，不传 ion token 也能看到地球。`pickObjectId` 返回图元上的业务 id，没有命中时返回 `undefined`。

用法见 [快速开始](/cesium/getting-started)、[打点](/cesium/points) 和 [拾取](/cesium/picking)。
