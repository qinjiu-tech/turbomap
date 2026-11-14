# 打点

每个打点任务持有自己的 `PointPrimitiveCollection`，不使用 `Entity`。取消任务只删这一份集合。

创建 Viewer 时用 OpenStreetMap 做底图。要换底图，传入 `options.viewer.baseLayer`。当前没有单独的业务图层管理器。

大规模点用 `pointAt` 按索引生成，避免先创建十万个对象：

```ts
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

也可以直接传 `points` 数组。`points` 与 `pointAt` 同时存在时只用 `points`。字段说明见 [点模型](/api/core)。
