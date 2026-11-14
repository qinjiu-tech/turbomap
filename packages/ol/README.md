# @turbomap/ol

OpenLayers 上的十万级打点。调度器是 `@turbomap/scheduler`，点模型是 `@turbomap/core`。

```bash
pnpm add @turbomap/ol ol
```

```ts
import { createOlMap } from '@turbomap/ol'
import 'ol/ol.css'

const api = createOlMap(container)
api.addPoints({
  count: 100_000,
  pixelSize: 3,
  pointAt: (index) => ({
    id: index,
    position: { longitude: 121.47, latitude: 31.23 },
  }),
})
```
