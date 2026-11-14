# 项目架构

这份说明对着当前仓库写。业务用法看 [介绍](/guide/introduction)、[Cesium](/cesium/getting-started) 和 [OpenLayers](/ol/getting-started)。当前库里是调度器、点模型，以及 Cesium 与 OpenLayers 的十万级打点。没有高亮、飞线、业务图层管理器和 Vue 组件包。

## 仓库在做什么

turbomap 把「什么时候画」和「用哪套地图引擎画」拆开。

- `@turbomap/scheduler` 只认识时间预算和 `FrameHost`。它不知道 Cesium，也不知道 OpenLayers，也不依赖 `@turbomap/core`。
- `@turbomap/core` 只有经纬度和 `MapPoint`。没有 `Cartesian3`，也没有调度器。
- `@turbomap/cesium` 创建 Viewer，把帧接成 `FrameHost`，按预算把点写入 `PointPrimitiveCollection`。
- `@turbomap/ol` 的 `OlMap` 继承 `ol/Map`。帧接在 `postrender`，点写入该任务自己的 `WebGLVector` 图层。

十万级点不走 Cesium `Entity`。每个打点任务单独持有一份图形，取消时只删这一份。示例是普通 Vue 页面，直接调用 `createCesiumMap` 或 `new OlMap`。

## 目录

```
turbomap/                          根包，私有，只放工作区脚本
├── package.json                 脚本、Node 版本、ESLint 与 Prettier
├── pnpm-workspace.yaml          哪些目录算工作区成员
├── pnpm-lock.yaml               锁文件，由 pnpm 生成，不手改
├── .npmrc                       peer 依赖不严格失败
├── tsconfig.base.json           各包共用的 TypeScript 选项
├── eslint.config.js             全仓库 ESLint 扁平配置
├── .prettierrc.json             排版
├── .prettierignore              Prettier 不碰的路径
├── .gitignore
├── AGENTS.md                    给代理的仓库约束，也是注释口径
├── packages/
│   ├── scheduler/               包名 @turbomap/scheduler
│   ├── core/                    包名 @turbomap/core
│   ├── cesium/                  包名 @turbomap/cesium
│   └── ol/                      包名 @turbomap/ol
├── examples/vue3/               包名 @turbomap/vue3-example，不发布
└── docs/                        包名 @turbomap/docs，VitePress，不发布
```

源码只在各包的 `src/`。发布包的 `package.json` 用 `"files": ["dist"]`，npm 上只有构建产物。

| 目录                   | npm 包名                        | 是否发布       | 运行时依赖                                  |
| ---------------------- | ------------------------------- | -------------- | ------------------------------------------- |
| `packages/scheduler`   | `@turbomap/scheduler`           | 是，最先 | 无                                      |
| `packages/core`        | `@turbomap/core`                | 是，最先 | 无                                      |
| `packages/cesium`      | `@turbomap/cesium`              | 是       | `@turbomap/core`、`@turbomap/scheduler`；`cesium` 是 peer |
| `packages/ol`          | `@turbomap/ol`                  | 是       | `@turbomap/core`、`@turbomap/scheduler`；`ol >= 9.5.0` 是 peer |
| `examples/vue3`        | `@turbomap/vue3-example`        | 否       | `@turbomap/cesium`、`@turbomap/ol`、`vue`、`cesium`、`ol`、`tdesign-vue-next` |
| `docs`                 | `@turbomap/docs`                | 否       | 只有 VitePress                          |

没有 Vue 组件包。示例页面自己创建地图。

每个可发布包旁边有一份 `AGENTS.md`，约束只作用于那个包。根目录 `AGENTS.md` 管包边界、调度规则和注释比例。

### 源码文件

`@turbomap/scheduler`

- `src/types.ts`：`FrameHost`、`SchedulableTask`、`TaskSnapshot`、`TaskStatus`
- `src/TaskScheduler.ts`：队列、时间预算、订阅
- `src/index.ts`：只导出类和公开类型，内部的任务记录不导出

`@turbomap/cesium`

- `src/CesiumMap.ts`：创建 Viewer，持有调度器
- `src/frameHost.ts`：`preUpdate` 与 `requestRender`
- `src/tasks/points.ts`：打点任务，一份 `PointPrimitiveCollection`
- `src/coordinates.ts`、`color.ts`、`id.ts`、`pick.ts`：坐标、颜色、内部 id、`pickObjectId`
- `src/index.ts`：再导出调度器和点模型，调用方只装这一个包也能写自定义任务

`@turbomap/ol`

- `src/OlMap.ts`：继承 `ol/Map`，默认导出。`createOlMap` 是同一构造的函数形式
- `src/frameHost.ts`：`postrender` 与 `map.render()`
- `src/points.ts`：打点任务，一份 `WebGLVector` 图层
- `src/pick.ts`：`pickFeatureId`
- `src/index.ts`：`OL_ENGINE_READY = true`，再导出调度器和点模型

`@turbomap/vue3-example`

- `src/App.vue`：顶部切引擎，左侧切功能
- `src/engines.ts`：功能清单。新增功能在这里登记
- `src/shared/useFullscreen.ts`：功能块共用的全屏
- `src/cesium/points/PointsDemo.vue`：Cesium 打点
- `src/ol/points/PointsDemo.vue`：OpenLayers 打点。文档页直接引用这一份
- 开发服务器固定 `127.0.0.1:5174`

## Monorepo

工作区由 pnpm 实现，不用 npm workspaces，也不用 yarn。根 `package.json` 写了 `"packageManager": "pnpm@11.2.2"`。装了 Corepack 的环境会按这个字段使用 pnpm 11.2.2，避免每个人的 pnpm 大版本不一致。`"engines": { "node": ">=24" }` 要求 Node 24 起。根目录 `.nvmrc` 写着 `24`。

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
  - 'examples/*'
  - 'docs'
allowBuilds:
  '@parcel/watcher': false
  esbuild: true
```

`packages` 下列出的 glob 才会成为工作区成员。`packages/*` 吃到四个库，`examples/*` 吃到两个示例，`docs` 是单独一条，因为文档不在 `packages` 或 `examples` 下面。

pnpm 10 起，依赖自己的安装脚本默认不跑。`esbuild` 的安装脚本要落下当前平台的二进制，Vite 构建靠它。`allowBuilds.esbuild: true` 只放开这一个包的构建脚本。`@parcel/watcher` 是 Sass 的可选依赖，这里设成 `false`，安装时不再询问。

### 依赖怎么连

包和包之间写 `workspace:*`，例如 `@turbomap/ol` 的 `dependencies` 里是 `"@turbomap/core": "workspace:*"` 和 `"@turbomap/scheduler": "workspace:*"`。`pnpm install` 时把它链到本仓库的对应包，不从 npm 下载同名包。`pnpm publish` 时，pnpm 会把 `workspace:*` 改写成当时的具体版本，发出去的包不会带 `workspace:` 协议。

`cesium`、`ol` 是 peerDependency。库的 Rollup `external` 把它们和 `@turbomap/core`、`@turbomap/scheduler` 留在产物外面。`cesium` 与 `ol` 的版本由业务项目决定。库自己的 `devDependencies` 里仍然安装一份，这样本仓库能做类型检查和本地构建。示例把引擎和 `vue` 写成正式 `dependencies`，因为它是真正跑起来的应用。示例里还装了 `tdesign-vue-next` 和 `sass`，只给页面用，不进发布包。

`@turbomap/cesium` 和 `@turbomap/ol` 把 `@turbomap/core`、`@turbomap/scheduler` 同时写在 `dependencies` 和 `devDependencies`。`dependencies` 会进入发布后的安装关系；`devDependencies` 里的 `workspace:*` 保证本仓库开发时一定链到本地源码。

根目录 `.npmrc`：

```
registry=https://registry.npmmirror.com/
# registry=https://registry.npmjs.org/
strict-peer-dependencies=false
```

当前安装走 npmmirror。官方源留在注释里。pnpm 默认会在 peer 范围对不齐时让安装失败。这个仓库里，库声明 `cesium >= 1.120`、`ol >= 9.5.0`，示例又各自声明自己的范围。关掉严格模式后，范围不完全重合时安装继续，终端里仍可能看到 peer 警告。

根包 `"private": true`。示例和文档也是 `private`。`pnpm publish` 从仓库根递归时不会把它们发出去。四个库的 `publishConfig.access` 是 `public`，发到 npm 时是公开包。

锁文件是 `pnpm-lock.yaml`。改依赖后用 `pnpm install` 更新它。不要手改锁文件来绕过解析。

### 过滤器

根脚本几乎都通过 `pnpm --filter <包名>` 进入某一个工作区包。过滤器匹配的是 `package.json` 的 `name`，不是文件夹名。所以示例的过滤器是 `@turbomap/vue3-example`。

被过滤的脚本在那个包的目录里执行。`pnpm --filter @turbomap/cesium build` 等价于进入 `packages/cesium` 再跑它的 `build`。

## 根脚本

根 `package.json` 的 `scripts` 是仓库的操作入口。逐条如下。

### `dev`

```json
"dev": "pnpm --filter @turbomap/vue3-example dev"
```

1. pnpm 在工作区里找到名为 `@turbomap/vue3-example` 的包。
2. 在 `examples/vue3` 执行该包的 `dev`，也就是 `vite`。
3. Vite 读取 `examples/vue3/vite.config.ts`。
4. 默认 `MAP_SOURCE` 不是 `0`，三个包名被别名到源码入口。
5. `@vitejs/plugin-vue` 编译示例的 `.vue`。
6. `vite-plugin-cesium` 复制 Cesium Worker，并设置静态资源路径。
7. 开发服务器听 `127.0.0.1:5173`。浏览器打开 `index.html`，模块脚本加载 `src/main.ts`，`createApp(App).mount('#app')`。

改 `packages/` 里的源码后，Vite 会按别名重新编译，不用先 `pnpm build`。

用已经构建的 `dist` 验证发布入口：

```bash
pnpm build
MAP_SOURCE=0 pnpm dev
```

`MAP_SOURCE=0` 时配置不再写 `resolve.alias`。`import '@turbomap/cesium'` 走该包的 `exports`，也就是 `dist/index.js`。这一步用来确认产物能被示例加载，而不是只在源码别名下能跑。OpenLayers 示例的别名是写死的，验证 `dist` 时要临时拿掉 `resolve.alias`。

### `build`

```json
"build": "pnpm --filter @turbomap/scheduler build && pnpm --filter @turbomap/core build && pnpm --filter @turbomap/cesium build && pnpm --filter @turbomap/ol build"
```

`&&` 表示前一个包失败就停。顺序跟依赖一致：

1. `@turbomap/scheduler` 和 `@turbomap/core` 没有上游。
2. `@turbomap/cesium` 和 `@turbomap/ol` 依赖前两个包。

每个包的 `build` 都是 `vite build`，按自己的 `vite.config.ts` 做库模式构建，产物在该包的 `dist/`。根 `build` 不包含示例，也不包含文档。示例要单独 `pnpm --filter @turbomap/vue3-example build`。文档是 `pnpm docs:build`。

`pnpm dev` 启动合并后的示例，端口 5174。顶部切换 Cesium 与 OpenLayers。

### `typecheck`

```json
"typecheck": "pnpm --filter @turbomap/scheduler typecheck && pnpm --filter @turbomap/core typecheck && pnpm --filter @turbomap/cesium typecheck && pnpm --filter @turbomap/ol typecheck && pnpm --filter @turbomap/vue3-example typecheck"
```

调度器和点模型的脚本是 `tsc -p tsconfig.json --declaration`，会写出 `dist` 里的 `.js` 和 `.d.ts`，让另外两个包在类型检查时能解析到它们。Cesium 与 OpenLayers 是 `tsc --noEmit`。示例用 `vue-tsc`。`tsc` 不理解单文件组件。

两段都要过：

- `tsconfig.json` 覆盖 `src`。引擎包的 `--noEmit` 只检查，不把 `.js` 写到 `dist`。真正出库产物的是 Vite。
- `tsconfig.node.json` 只包含 `vite.config.ts`，并打开 Node 类型。配置文件不进浏览器 `lib`，所以单独一份。

Cesium 和 OpenLayers 的 `paths` 把 `@turbomap/core`、`@turbomap/scheduler` 指到本包 `src/ts-paths/` 里的声明垫片。这样类型检查的 `rootDir` 停在 `src`。运行时的 `import` 仍是包名，由 Vite 的 `external` 留在产物外面。

### `docs:dev` 与 `docs:build`

```json
"docs:dev": "pnpm --filter @turbomap/docs dev",
"docs:build": "pnpm --filter @turbomap/docs build"
```

`@turbomap/docs` 的 `dev` 是 `vitepress dev`，`build` 是 `vitepress build`。文档站和示例是两个进程。示例占着 5173 时，VitePress 会改用下一个空闲端口，以终端打印的地址为准。静态产物在 `docs/.vitepress/dist`。

文档源码不能在构建期静态 `import cesium`。VitePress 构建跑在 Node 里，Cesium 会去碰浏览器全局对象。文档只引用 `examples/vue3` 里不加载 Cesium 的 OpenLayers 功能组件。

### `lint` 与 `lint:fix`

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix"
```

在仓库根执行。ESLint 9 之后使用扁平配置，入口就是根目录的 `eslint.config.js`。`.` 表示从当前目录往下扫。`globalIgnores` 去掉 `dist`、`node_modules` 和 VitePress 的缓存、产物。`--fix` 只改规则标明可自动修的问题。排版交给 Prettier，ESLint 不跟它抢格式。

### `format` 与 `format:check`

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

`--write` 直接改文件。`--check` 只报告不符合 `.prettierrc.json` 的文件，适合提交前。忽略名单在 `.prettierignore`。`.cursor/rules/*.mdc` 没有对应的 Prettier 解析器，不要对它跑格式化。

## TypeScript

`tsconfig.base.json` 是所有包的底。各包用 `extends` 接上，只补自己的 `rootDir`、`paths` 和 `include`。

| 选项                                              | 作用                                                                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `target: ES2022`                                  | 语法降到 ES2022。调度器用到 `performance.now` 和类字段，不需要更老的输出。                                            |
| `module` / `moduleResolution: ESNext` + `bundler` | 跟 Vite 的解析方式一致，允许 `exports` 条件。                                                                         |
| `lib: ES2022 + DOM`                               | 调度器的 `requestAnimationFrame` 和 Cesium 的 DOM 都在这个库里。                                                      |
| `strict`                                          | 打开全部严格检查。                                                                                                    |
| `skipLibCheck`                                    | 不检查 `cesium` 等依赖自己的 `.d.ts`，避免第三方声明拖垮本仓库。                                                      |
| `isolatedModules`                                 | 每个文件可独立编译。Vite 按文件转换，跨文件的 `const enum` 这类写法会出问题。                                         |
| `useDefineForClassFields`                         | 类字段用标准语义，和 ES2022 目标一致。                                                                                |
| `noUnusedLocals` / `noUnusedParameters`           | 没用到的变量和参数直接报错。                                                                                          |
| `noFallthroughCasesInSwitch`                      | `switch` 不允许悄悄落到下一个分支。                                                                                   |
| `verbatimModuleSyntax`                            | 类型导入必须写成 `import type`。引擎包的入口把值导出和类型导出分成两段，擦掉类型后运行时代码仍然合法。 |

示例额外设置 `"jsx": "preserve"`。单文件组件里的模板由 Vue 插件处理，TypeScript 不要把 JSX 编成 React 调用。

路径别名只存在于各包的 `tsconfig.json`，不在 `tsconfig.base.json` 里。Cesium 和 OpenLayers 把 `@turbomap/core`、`@turbomap/scheduler` 指到本包 `src/ts-paths/` 里的声明垫片，这样 `rootDir` 停在 `src`。这只影响 `tsc`。Vite 库构建没有抄这些 `paths`，源码里的 `from '@turbomap/scheduler'` 会原样留在产物里，再由 `rollupOptions.external` 标成外部依赖。

## 库构建

四个库都是 Vite library mode，同时出 ESM 和 CJS。

共同形态：

- `build.emptyOutDir: true`：每次清空 `dist`，避免已经删掉的导出还留在目录里。
- `build.sourcemap: true`：业务项目里的报错能回到这里的 TypeScript。
- `build.lib.entry`：各包的 `src/index.ts`。
- `formats: ['es', 'cjs']`，文件名固定为 `index.js` 和 `index.cjs`，对应 `package.json` 的 `exports`。
- `vite-plugin-dts` 的 `bundleTypes: true` 把声明收成一份 `dist/index.d.ts`。调用方不用跟着源码目录走。`tsconfigPath` 指向本包的 `tsconfig.json`，避免把别的包的源码卷进声明。

`exports` 的条件顺序是 `types`、`import`、`require`。打包器按条件选 ESM 或 CJS，TypeScript 选 `types`。`main`、`module`、`types` 三个旧字段保留，给还没完全按 `exports` 解析的工具。

### 调度器

`packages/scheduler/vite.config.ts` 没有 `rollupOptions.external`。这个包没有运行时依赖，产物里也不应该出现 `cesium`、`ol` 或 `vue`。没有 CSS，所以不配置样式文件名。

### Cesium 适配

```ts
external: [/^cesium($|\/)/, '@turbomap/core', '@turbomap/scheduler']
```

`cesium` 和 `cesium/...` 子路径都排除。`@turbomap/core` 与 `@turbomap/scheduler` 保持为包名导入。Cesium 的静态资源和 Worker 不打进 `@turbomap/cesium`，由使用方的 `vite-plugin-cesium` 处理。

### OpenLayers 适配

```ts
external: ['@turbomap/core', '@turbomap/scheduler', /^ol($|\/)/]
```

`ol` 和 `ol/...` 子路径都排除。点写入 `WebGLVector`，经纬度经 `fromLonLat` 投到 EPSG:3857。入口是 `src/index.ts`，默认导出 `OlMap`。

四个库都写了 `sideEffects: false`。它们没有模块级副作用，打包器可以按导出做 tree-shaking。

每个可发布包的 `prepublishOnly` 是 `pnpm build`。执行 `pnpm publish` 时会先构建当前包，避免发出没有 `dist` 的版本。

发布顺序：

```bash
pnpm --filter @turbomap/scheduler publish
pnpm --filter @turbomap/core publish
pnpm --filter @turbomap/cesium publish
pnpm --filter @turbomap/ol publish
```

先发调度器和点模型。两个引擎包的 `workspace:*` 在发布时写成已经发布的版本。

## 示例开发服务器

`examples/vue3/vite.config.ts`：

```ts
const source = process.env.MAP_SOURCE !== '0'
```

环境变量没设，或者设成别的值，都走源码。只有明确写成 `0` 才走 `dist`。

源码模式下四个别名都指到对应包的 `src/index.ts`：`@turbomap/cesium`、`@turbomap/ol`、`@turbomap/core`、`@turbomap/scheduler`。

`server.host` 是 `127.0.0.1`。只绑 IPv6 时，有的环境用 `127.0.0.1` 打不开。端口固定 5174，避开常被文档占用的 5173。

`server.fs.allow: ['../..']` 允许开发服务器读取仓库根。Vite 默认只服务应用自己的目录。别名指向 `packages/`，不放开文件系统就会读不到源码。

插件是 `vue()` 和 `cesium()`。Vue 插件编译示例页面。Cesium 插件复制 Worker 和静态资源。不要在仓库里再手抄一份 Cesium 资源。`src/main.ts` 同时引入 Cesium `widgets.css`、`ol/ol.css` 和 TDesign 样式。没有 Cesium 控件样式时，画布高度会是 0。

## ESLint

配置是 `eslint.config.js`，ESM（根包 `"type": "module"`）。它用 ESLint 扁平配置数组，后面的配置块可以覆盖前面的规则。

```js
import { globalIgnores } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
```

依赖都装在根包的 `devDependencies`，子包不再各装一份 ESLint。这样全仓库只有一套规则。

### 忽略

```js
globalIgnores([
  '**/dist/**',
  '**/node_modules/**',
  'docs/.vitepress/cache/**',
  'docs/.vitepress/dist/**',
])
```

`dist` 是生成物，改它没有意义。`node_modules` 是第三方。VitePress 的缓存和构建结果同样不检查。忽略写在最前面，后面的 Vue 规则不会再扫这些目录。

### Vue 与 TypeScript

`pluginVue.configs['flat/recommended']` 打开 `eslint-plugin-vue` 的推荐规则，检查模板和脚本的常见错误，例如非法指令、未使用的组件变量。

`defineConfigWithVueTs` 来自 `@vue/eslint-config-typescript`。它把 Vue 单文件组件和 TypeScript 解析接在一起，让 `.vue` 里的 `<script lang="ts">` 能用类型规则。`vueTsConfigs.recommended` 是这套工具提供的推荐规则，而不是再手写一份 parser。

### 关掉的一条 Vue 规则

```js
'vue/require-default-prop': 'off'
```

这条规则要求每个可选 prop 都有默认值。示例里的按钮和地图参数可以不传。不传时交给组件或引擎自己的默认值。在页面里填空字符串或 `0` 会变成另一种含义，所以关掉这条。

### 包边界

`engineBoundary(group, message)` 生成一条 `no-restricted-imports`，级别是 `error`。`patterns.group` 是禁止的模块名。`cesium/*` 这种写法连子路径一起禁掉。

| 匹配的文件                         | 禁止导入                                      | 原因                                       |
| ---------------------------------- | --------------------------------------------- | ------------------------------------------ |
| `packages/scheduler/**/*.{ts,vue}` | `cesium`、`ol`、`vue`、`@turbomap/core`       | 调度器只能依赖 `FrameHost`                 |
| `packages/core/**`                 | `cesium`、`ol`、`vue`、调度器和两个引擎包     | 点模型不认识引擎，也不认识调度器           |
| `packages/cesium/**`               | `ol`、`vue`、`@turbomap/ol`                   | Cesium 适配不认识 OpenLayers，也不认识 Vue |
| `packages/ol/**`                   | `cesium`、`vue`、`@turbomap/cesium`           | OpenLayers 适配不认识 Cesium，也不认识 Vue |

示例和文档不在这些 `files` 里。示例可以同时写 Vue 和其中一套引擎，那是应用，不是库的边界。

### 把格式让给 Prettier

最后一项是 `skipFormatting`，来自 `@vue/eslint-config-prettier/skip-formatting`。它关掉所有和 Prettier 重叠的 ESLint 规则，例如引号、分号、换行。保存时先由 ESLint 修逻辑问题，再由 Prettier 排版，两套工具不会来回改同一个文件。

根上的开发依赖对应这四件事：`eslint` 本体，`eslint-plugin-vue` 提供 Vue 规则，`@vue/eslint-config-typescript` 接 TypeScript，`@vue/eslint-config-prettier` 提供 `skipFormatting`。

## Prettier

`.prettierrc.json`：

| 字段            | 值       | 原因                                                                      |
| --------------- | -------- | ------------------------------------------------------------------------- |
| `semi`          | `false`  | 源码不写分号，和现有 TypeScript 一致。                                    |
| `singleQuote`   | `true`   | 字符串用单引号。需要插值或字符串里有单引号时，Prettier 会自己换成双引号。 |
| `trailingComma` | `all`    | 多行的参数、数组、对象最后一项留逗号。以后加一行时 diff 只有新增行。      |
| `printWidth`    | `100`    | 地图配置和模板属性比较长，80 列会拆得很碎。100 列在编辑器里仍能看全。     |
| `arrowParens`   | `always` | 箭头函数即使只有一个参数也写括号，改参数时不用再动括号。                  |
| `endOfLine`     | `lf`     | 统一用 LF。仓库在 macOS 上开发，也避免 Windows 把 CRLF 写进 diff。        |

`.prettierignore` 排除 `node_modules`、`dist`、`pnpm-lock.yaml`，以及 VitePress 的缓存和产物。锁文件由 pnpm 格式化，Prettier 重排会制造无意义的大 diff。

`.vscode/settings.json` 把默认格式化器设为 Prettier，保存时格式化。`source.fixAll.eslint` 设为 `explicit`，保存时跑 ESLint 自动修复。`eslint.useFlatConfig: true` 告诉编辑器使用 `eslint.config.js`，而不是旧的 `.eslintrc`。Vue、TypeScript、JSON、Markdown 都指定 Prettier，避免 Vue 官方扩展和 Prettier 抢 `<template>` 的格式。

`.vscode/extensions.json` 推荐 ESLint 和 Prettier 两个扩展。打开仓库时编辑器会提示安装。

`.gitignore` 忽略 `node_modules`、`dist`、`.DS_Store`、`*.local`、`*.tsbuildinfo`、VitePress 缓存和产物、`.eslintcache`。`dist` 这条会盖住示例自己的构建输出。

## 一次打点怎么画出来

Cesium 示例：

```text
App.vue
  → createCesiumMap(container)
       → createCesiumFrameHost(viewer)     preUpdate / requestRender
       → new TaskScheduler(host)
  → addPoints(...)
       → createPointsTask
       → scheduler.submit
            → requestFrame()
            → scene.requestRender()
            → preUpdate 里 frame()
            → task.tick(deadline)
            → 写入该任务自己的 PointPrimitiveCollection
```

OpenLayers 示例：

```text
App.vue
  → new OlMap(container)
       → OSM 瓦片 + EPSG:3857 视图
       → createOlFrameHost(map)            postrender / map.render()
       → new TaskScheduler(host)
  → addPoints(...)
       → createPointsTask
       → scheduler.submit
            → map.render()
            → postrender 里 frame()
            → task.tick(deadline)
            → 写入该任务自己的 WebGLVector 图层
```

### 页面挂上地图

示例在 `onMounted` 里创建地图，实例放进 `shallowRef`。Cesium 的 Viewer 和 OpenLayers 的 Map 内部都有循环引用，放进 `reactive()` 会被 Vue 深度遍历。

Cesium 用 `createCesiumMap(container)`。`createViewer` 关掉大部分控件，打开 `requestRenderMode`，`maximumRenderTimeChange` 设为无穷大。底图是 OSM，没有 ion token 也能看到地球。`depthTestAgainstTerrain` 关掉，高度为 0 的点不会被地表裁掉。构造函数接着做两件事：`createCesiumFrameHost(this.viewer)`，然后 `new TaskScheduler`。销毁时先 `scheduler.destroy()`，再 `viewer.destroy()`。

OpenLayers 用 `new OlMap(container)`。构造函数放一层 OSM 瓦片和 3857 视图，默认中心是东经 108、北纬 32，缩放 4。帧宿主是 `createOlFrameHost(this)`。`destroy()` 先停调度器，再 `setTarget(undefined)`。字段名叫 `tornDown`，因为 `ol/Map` 自己已经有 `disposed`。

### 帧怎么接上

`FrameHost` 只有两个方法：

- `onFrame(listener)` 注册，并返回取消函数
- `requestFrame()` 请求引擎画一帧

Cesium 把 listener 挂在 `scene.preUpdate`，`requestFrame` 调用 `scene.requestRender()`。OpenLayers 把 listener 挂在 `postrender`，`requestFrame` 调用 `map.render()`。地图 target 拆掉后不再回调。

调度器在构造时就 `host.onFrame(() => this.frame())`。有未完成任务，或仍有 `onFrame` 时，才继续 `requestFrame`。没有这类工作时不再请求下一帧，下一次 `submit` 再启动。

### 提交任务

`addPoints` 在地图已销毁时抛错，不会把任务交给已经拆掉的调度器。然后 `createPointsTask` 得到一个 `SchedulableTask`，`scheduler.submit` 放进队列。

`submit` 拒绝重复 id，也拒绝在调度器销毁后提交。写入队列后推给订阅者，并立刻 `requestFrame`。第一帧不用等用户再去拖地图。

### 一帧里做多少

```ts
const deadline = performance.now() + this.frameBudgetMs
```

`frameBudgetMs` 默认 6，构造时夹到 1 到 32 毫秒。这是墙钟预算，不是按帧率反推一批点。

队列按时间预算轮询。这一帧先给一个任务一段，到截止时间就停；下一帧继续后面的任务。不要把所有任务串成必须等前一个结束的队列。

`tick` 必须在 `deadline` 前返回。返回 `true` 表示完成。抛错则状态是 `failed`，并调用该任务的 `destroy`。

快照是纯数据：`id`、`name`、`type`、`status`、`progress`、`error`。状态有 `pending`、`running`、`done`、`failed`。取消会把记录从列表删除。

### 点画在哪里

Cesium 点任务持有一份 `PointPrimitiveCollection`。`points` 与 `pointAt` 同时给出时只用 `points`。大规模打点用 `pointAt(index)` 和 `count`。取消时从场景里移除这一份集合。

OpenLayers 点任务持有一份 `WebGLVector` 图层。经纬度先 `fromLonLat` 到 EPSG:3857。每 1000 个点 `addFeatures` 一次。样式用要素上的 `size` 和 `color`。点击用 `pickFeatureId`，它读的是 `feature.setId` 写下的业务 id。取消时 `removeLayer` 并 `dispose`，否则 WebGL 上下文还会留着。

## 文档站

`docs/.vitepress/config.ts` 设置中文语言、导航和侧边栏。开发服务器 `host: true`，局域网可以用 IP 打开。页面是 Markdown：`index.md` 是首页，`guide/` 放两套引擎共用的说明，`cesium/` 和 `ol/` 各写安装、打点和拾取，`api/` 按包拆开。`docs/package.json` 私有，脚本只有 `vitepress dev`、`build`、`preview`。文档构建不静态导入 `cesium` 或 `ol`。

## 注释口径

`packages` 与 `apps` 里的 `.ts`、`.vue` 按五类处理。文件头可选、最多一段、不计入比例。函数和类注释、块注释、模板注释计入，行尾注释不计入。比例是计入的整行注释除以「非空行减去文件头」，要落在 15% 到 30%。文件头必须用空行和后面的内容隔开，否则整段都会被当成文件头。完整表在根目录 `AGENTS.md`。示例目录不按这个比例计。

## 现在还没有的部分

- 没有图标图集、告警高亮、弹窗、Label、水位面，也没有 Vue 组件包。
- 根 `build` 不产出示例和文档。
- 仓库没有把 CI 配置放进当前树。提交前在本地跑 `pnpm typecheck`、`pnpm lint`、`pnpm format:check` 和 `pnpm build`。
