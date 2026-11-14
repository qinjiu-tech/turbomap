# scheduler

本包没有地图引擎。只维护任务队列、时间预算和 `FrameHost`。

- 禁止 import `cesium`、`ol`、`vue`，也不要依赖 `@turbomap/core`。
- `tick(deadline)` 的 deadline 是 `performance.now()` 的截止时刻。
- 取消任务要同时 `cancel` 和 `destroy`，并从队列里移除。
- 已完成但仍有 `onFrame` 的任务留在列表里，直到用户取消。
- 不要在这里创建点、线、面或 DOM。
