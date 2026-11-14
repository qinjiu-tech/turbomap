# 拾取

`pickObjectId` 从窗口坐标取出业务 id。点上的 id 写在图元上。没有命中时返回 `undefined`。

```ts
import * as Cesium from 'cesium'
import { createCesiumMap, pickObjectId } from '@turbomap/cesium'

const api = createCesiumMap(container)

api.viewer.screenSpaceEventHandler.setInputAction((event) => {
  const id = pickObjectId(api.viewer, event.position)
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
```
