# cesium

Cesium 适配层，包名 `@turbomap/cesium`。可以依赖 `@turbomap/scheduler`、`@turbomap/core` 和 `cesium`。禁止依赖 `ol` 和 `vue`。

- 通过 `createCesiumFrameHost` 把 `preUpdate` / `requestRender` 交给调度器。
- 打点任务单独持有一份 `PointPrimitiveCollection`，不要用 `Entity` 扛十万级。
- 颜色字符串要缓存，避免十万次解析。
- 经纬度来自 `@turbomap/core`。`Cartesian3` 只留在本包。
- 销毁顺序：调度器、Viewer。
