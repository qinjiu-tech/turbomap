# core

引擎无关的点位模型，包名 `@turbomap/core`。

- 禁止 import `cesium`、`ol`、`vue`，也不要依赖 `@turbomap/scheduler`。
- 只放经纬度和 `MapPoint`。`Cartesian3`、投影转换、事件总线都不在这里。
- 十万级打点的分帧仍由调度器负责，本包不出现 `requestAnimationFrame`。
