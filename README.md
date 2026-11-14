# turbomap

可更换地图引擎的前端地图库。Cesium 与 OpenLayers 都能按帧预算打十万级点。

需要 Node.js 24 或以上，包管理器用 pnpm 11。

## 项目结构

根包 `turbomap` 是私有的，只提供工作区脚本。会发布到 npm 的是 `packages/` 里的四个包。示例和文档不发布。

```
turbomap/
├── packages/
│   ├── scheduler/           # @turbomap/scheduler   帧预算调度，零依赖
│   ├── core/                # @turbomap/core        经纬度与 MapPoint
│   ├── cesium/              # @turbomap/cesium      Viewer 与十万级打点
│   └── ol/                  # @turbomap/ol          OpenLayers 与十万级打点
├── examples/vue3/           # 本地验证，不发布。顶部切引擎，左侧切功能
├── docs/                    # @turbomap/docs        VitePress，不发布
├── AGENTS.md
└── package.json
```

调度器只认识 `FrameHost`。点的经纬度在 `core`。Cesium 把经纬度换成 `Cartesian3`，按每帧时间预算写入 `PointPrimitiveCollection`。

| 目录                 | 包名                     | 发布                   |
| -------------------- | ------------------------ | ---------------------- |
| `packages/scheduler` | `@turbomap/scheduler`    | 是，可与 core 一起先发 |
| `packages/core`      | `@turbomap/core`         | 是                     |
| `packages/cesium`    | `@turbomap/cesium`       | 是                     |
| `packages/ol`        | `@turbomap/ol`           | 是                     |
| `examples/vue3`      | `@turbomap/vue3-example` | 否                     |
| `docs`               | `@turbomap/docs`         | 否                     |

`cesium` 是 peerDependency。库的构建把它 external 掉，由业务项目自己安装。没有 Vue 组件包。

## 本地开发

```bash
pnpm install
pnpm dev
```

`pnpm dev` 启动 `examples/vue3`，地址是 http://127.0.0.1:5174/ 。顶部切换 Cesium 与 OpenLayers，左侧切换功能。开发时四个库都指到源码，改包后不用先构建。

文档：

```bash
pnpm docs:dev
```

这是 VitePress。示例已经占用 5173 时，文档会改用下一个空闲端口，以终端里打印的地址为准。静态文档用 `pnpm docs:build`，产物在 `docs/.vitepress/dist`。

提交前：

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

`typecheck` 覆盖四个库和 `examples/vue3`。`build` 只构建要发布的四个库，不包含示例和文档。

用已构建的 `dist` 跑示例，用来核对发布入口：

```bash
pnpm build
MAP_SOURCE=0 pnpm dev
```

只跑一个包时用过滤器，例如 `pnpm --filter @turbomap/cesium typecheck`。示例单独构建是 `pnpm --filter @turbomap/vue3-example build`。

## 构建与发布

`@turbomap/core` 不依赖调度器。`@turbomap/cesium` 和 `@turbomap/ol` 依赖调度器，Cesium 包还依赖 core。先发 scheduler 和 core，再发两个引擎包。

```bash
pnpm --filter @turbomap/scheduler publish
pnpm --filter @turbomap/core publish
pnpm --filter @turbomap/cesium publish
pnpm --filter @turbomap/ol publish
```

每个包的 `prepublishOnly` 会先构建自己。工作区里的 `workspace:*` 会在 `pnpm publish` 时写成具体版本。`publishConfig.access` 已是 `public`。根包、示例、文档都是 `private`，不会被发出去。

发之前在本仓库跑过 `pnpm typecheck` 和 `pnpm build`。需要确认安装包入口时，再用上一节的 `MAP_SOURCE=0 pnpm dev`。

## 在业务项目中使用

```bash
pnpm add @turbomap/cesium @turbomap/core cesium
```

Vite 需要 `vite-plugin-cesium`，并引入 `cesium/Build/Cesium/Widgets/widgets.css`。容器要有高度。

```ts
import { createCesiumMap } from '@turbomap/cesium'

const api = createCesiumMap(container)

api.addPoints({
  name: '样本点',
  count: 100_000,
  pixelSize: 3,
  pointAt: (index) => ({
    id: index,
    position: { longitude: 121.47, latitude: 31.23 },
  }),
})

api.cancelTask(id)
api.destroy()
```

OpenLayers 包同样可以分帧打点。更完整的说明在 `docs/`，本地用 `pnpm docs:dev` 查看。

## 贡献

只使用 pnpm 安装和发布。改调度规则先看 `packages/scheduler/AGENTS.md`，改引擎适配先看对应子包的 `AGENTS.md`。仓库级约束在根目录 `AGENTS.md`。`packages` 与 `apps` 里的源码，函数/类注释、块注释和模板注释占去掉文件头后的非空行的 15% 到 30%。口径在 `AGENTS.md`。

## 许可证

MIT，见 [LICENSE](LICENSE)。
