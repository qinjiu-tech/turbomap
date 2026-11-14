# 调度器

打点是当前唯一的地图任务。调度器只依赖 `FrameHost`。每一帧有一个时间预算，默认 6ms，限制在 1 到 32ms。

有未完成任务时才请求下一帧。`tick` 在截止时间前返回，全部完成时返回 `true`。`cancel` 清掉该任务自己的图形。

`scheduler.subscribe` 会立刻推送当前快照，并返回取消订阅的函数。自定义任务可以实现 `SchedulableTask`，再交给 `scheduler.submit`。

帧从引擎来：

- Cesium 把监听挂在 `Scene.preUpdate`，渲染请求是 `scene.requestRender()`。点怎么写入见 [Cesium 打点](/cesium/points)。
- OpenLayers 把监听挂在地图 `postrender`，渲染请求是 `map.render()`。点怎么写入见 [OpenLayers 打点](/ol/points)。

`addPoints` 的参数两套引擎相同，字段说明在 [点模型](/api/core)。
