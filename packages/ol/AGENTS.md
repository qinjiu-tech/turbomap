# ol

OpenLayers 适配，包名 `@turbomap/ol`。可以依赖 `@turbomap/scheduler`、`@turbomap/core` 和 `ol`。禁止依赖 `cesium` 和 `vue`。

- 帧入口是地图的 `postrender`，渲染请求是 `map.render()`。
- 每个打点任务一份 `WebGLVector` 图层。OL 10 已弃用 `WebGLPointsLayer`，这条路径仍是 GPU 批量画点。
- 经纬度来自 `@turbomap/core`，写入要素时再投影到 3857。
- 取消任务必须 `dispose` 图层，否则 WebGL 资源不会释放。
- `ol` 是 peerDependency，构建时 external。
