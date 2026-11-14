<script setup>
import PointsDemo from '../../examples/vue3/src/ol/points/PointsDemo.vue'
</script>

# 打点

`OlMap` 构造时放一层 OSM 瓦片。每个打点任务再加一层 `WebGLVector`。取消任务只 `removeLayer` 并 `dispose` 这一层，底图还在。`dispose` 用来释放 WebGL 上下文。

每 1000 个点提交一次要素。经纬度经 `fromLonLat` 投到 EPSG:3857。

大规模点用 `pointAt` 按索引生成，避免先创建十万个对象：

```ts
map.addPoints({
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

## 看效果

下面这块就是示例里的打点功能。可以打 2 万点或 10 万点，也可以点选已经画出来的点。

<div class="ol-docs-demo">
  <ClientOnly>
    <PointsDemo />
  </ClientOnly>
</div>

<style>
.ol-docs-demo {
  height: 520px;
  margin: 16px 0 24px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}
</style>
