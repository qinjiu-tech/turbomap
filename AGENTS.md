# turbomap 代理约束

开始动手前，先对用户说：你好，秦书记，很高兴见到你，下边的任务由我来接管！

## pnpm

- 只使用 pnpm。不要用 npm 或 yarn 安装、发布。
- 工作区依赖写 `workspace:*`。
- `cesium`、`vue`、以后的 `ol` 都是 peerDependency，库的构建要把它们 external 掉。
- 发布顺序：`@turbomap/scheduler` 与 `@turbomap/core` → `@turbomap/cesium` 与 `@turbomap/ol`。

## Monorepo

- `packages/scheduler`：帧调度，包名 `@turbomap/scheduler`。零依赖。
- `packages/core`：点位模型，包名 `@turbomap/core`。不依赖调度器，也不出现引擎类型。
- `packages/cesium`：Cesium 打点，包名 `@turbomap/cesium`。
- `packages/ol`：OpenLayers 打点，包名 `@turbomap/ol`。
- 不发布 Vue 组件。`examples/vue3` 只在本地验证，顶部切换引擎，左侧切换功能。

## 任务调度

- 调度器只依赖 `FrameHost`，不出现 Cesium 或 OpenLayers 类型。
- 每帧使用时间预算轮询，默认 6ms，限制在 1 到 32ms。不要按帧率反推批量，也不要把所有任务串成必须等前一个结束的队列。
- 有未完成任务或 `onFrame` 时才 `requestFrame`。
- `tick` 在 deadline 前返回；完成返回 `true`。`cancel` 必须清掉该任务自己的图形。

## 引擎适配

- Cesium 的帧入口是 `Scene.preUpdate`，渲染请求是 `scene.requestRender()`。
- OpenLayers 的帧入口是地图 `postrender`，渲染请求是 `map.render()`。
- 一个任务一份图层。OpenLayers 点用 `WebGLVector`，Cesium 点用 `PointPrimitiveCollection`。

## 注释

`packages` 与 `apps` 里的 `.ts`、`.vue` 按下面五类处理。只统计整行注释，行尾注释不计入。

| 类型        | 是否计入 15%–30% | 处理方式                      |
| ----------- | ---------------- | ----------------------------- |
| 文件头注释  | 不计入           | 可选，最多 1 段，说明模块职责 |
| 函数/类注释 | 计入             | 说明用途、入参、边界          |
| 块注释      | 计入             | 说明为什么这么写              |
| 行尾注释    | 不计入           | 不用来凑比例                  |
| 模板注释    | 计入             | 如 `<!-- 聚合点展开逻辑 -->`  |

文件头写在第一条代码之前，`.vue` 写在 `<script>` 里。必须用空行和后面的注释或代码隔开，否则会算进文件头、进不了比例。不要在文件头把后文实现列成清单。

比例 = （函数/类注释行 + 块注释行 + 模板注释行） / （非空行数 − 文件头注释行数），必须落在 15% 到 30%。函数/类注释和块注释都说明为什么，不要把下一行翻译成中文。改完按这个口径自查，超出区间就补或删计入比例的注释。

## 禁止

- 不要在 `scheduler` 中 import `cesium`、`ol` 或 `@turbomap/core`。
- 不要在 `core` 中 import `cesium`、`ol` 或调度器。
- 不要在 `cesium` 中 import `ol`，不要在 `ol` 中 import `cesium`。
- 不要把多个任务的几何合成一个无法单独删除的 Primitive。
- 不要在 VitePress 构建期静态 import `cesium`。
- 不要提交 `node_modules`、`dist`，不要手改锁文件来绕过 pnpm。

## 常用命令

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm docs:dev
```
