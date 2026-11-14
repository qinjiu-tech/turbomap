// 内部任务 id。业务传入自己的 id 时，工厂不会覆盖。
// 只在本包使用，不从入口导出。

let seed = 0

/** 生成包内任务 id。prefix 只用于区分类型；种子递增再加时间，避免同一次点击撞号。 */
export function createId(prefix: string): string {
  seed += 1
  return `${prefix}-${seed.toString(36)}-${Date.now().toString(36)}`
}
