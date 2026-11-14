# 点模型

`@turbomap/core` 提供 `LngLat` 和 `MapPoint`。经度、纬度单位是度，高度单位是米。

`addPoints` 返回任务 id。Cesium 与 OpenLayers 使用同一份参数。

| 字段 | 作用 |
| --- | --- |
| `id` | 任务 id。缺省由库生成。 |
| `name` | 快照里的名称。 |
| `points` | 已经准备好的点。与 `pointAt` 同时存在时只用这份数组。 |
| `pointAt` | 按索引生成点。十万级打点用它，避免先分配一整份数组。 |
| `count` | `pointAt` 的点数量。 |
| `color` | 缺省颜色，默认 `#38bdf8`。 |
| `pixelSize` | 缺省像素大小，默认 6。 |

单个点可以再写自己的 `id`、`color`、`pixelSize` 和 `position`。
