// 包入口只暴露调度器和公开类型。
// 任务记录是内部结构，不从这里导出。

// 选项类型跟类走，调用方不用再找一个内部文件。
export { TaskScheduler } from './TaskScheduler'
export type { TaskSchedulerOptions } from './TaskScheduler'
export type { FrameHost, SchedulableTask, TaskSnapshot, TaskStatus } from './types'
