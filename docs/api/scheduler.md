# 调度器

`@turbomap/scheduler` 导出 `TaskScheduler` 和这些类型：`FrameHost`、`SchedulableTask`、`TaskSchedulerOptions`、`TaskSnapshot`、`TaskStatus`。

`scheduler.subscribe` 会立刻推送当前快照，并返回取消订阅的函数。自定义任务可以实现 `SchedulableTask`，再交给 `scheduler.submit`。

`tick(deadline)` 里用 `performance.now() < deadline` 控制本次能做多少。全部完成时返回 `true`。`cancel` 必须清掉这个任务自己的图形。

帧预算默认 6ms，限制在 1 到 32ms。有未完成任务或 `onFrame` 时才请求下一帧。
