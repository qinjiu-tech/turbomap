# @turbomap/cesium

Cesium 上的十万级打点。调度器是 `@turbomap/scheduler`，点模型是 `@turbomap/core`。

```bash
pnpm add @turbomap/cesium cesium
```

```ts
import { createCesiumMap } from '@turbomap/cesium'

const api = createCesiumMap(container)
api.addPoints({
  count: 100_000,
  pointAt: (index) => ({
    id: index,
    position: { longitude: 121.47, latitude: 31.23 },
  }),
})
```
