# 拾取

`pickFeatureId` 在点击像素处取最近要素的业务 id。这个 id 来自 `feature.setId`。没有命中时返回 `undefined`。WebGL 点图层的命中检测要保持打开，关掉后这里拿不到要素。

```ts
import OlMap, { pickFeatureId } from '@turbomap/ol'

const map = new OlMap(container)

map.on('click', (event) => {
  const id = pickFeatureId(map, event.pixel)
})
```
