# 快速开始

```bash
pnpm add @turbomap/cesium cesium
```

`cesium` 是 peer dependency。`@turbomap/core` 和 `@turbomap/scheduler` 会随 `@turbomap/cesium` 安装。

Cesium 的 Worker 和静态资源需要能被页面访问。推荐使用 `vite-plugin-cesium`，并引入控件样式：

```ts
import { defineConfig } from 'vite'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  plugins: [cesium()],
})
```

```ts
import 'cesium/Build/Cesium/Widgets/widgets.css'
```

容器需要有高度。

```ts
import { createCesiumMap } from '@turbomap/cesium'

const api = createCesiumMap(container)

api.addPoints({
  name: '10 万点',
  count: 100_000,
  pixelSize: 3,
  pointAt: (index) => ({
    id: index,
    position: { longitude: 121.47, latitude: 31.23 },
  }),
})
```

默认底图是 OpenStreetMap，不需要 Cesium ion token。有 ion token 时传 `options.ionAccessToken`。点怎么画进场景见 [打点](/cesium/points)，点击见 [拾取](/cesium/picking)。
