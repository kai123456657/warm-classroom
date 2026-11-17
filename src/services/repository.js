/**
 * 数据仓储接口契约（概念约定，JS 无interface，用注释说明）
 *
 * 这是前端与数据源之间唯一的抽象层。所有页面通过 useData → Repository 访问数据。
 * 默认实现 LocalRepository（localStorage）；后端就绪后改 config.js 的 DATA_SOURCE='http'
 * 即切换到 HttpRepository，页面代码无需任何改动。
 *
 * 每个仓储需实现：
 *   loadAll()              一次性加载全部集合 -> GET /api/bootstrap
 *   list(key)              读取单个集合        -> GET /api/{resource}
 *   getById(key,id)        读取单条            -> GET /api/{resource}/{id}
 *   create(key,item)       新增                -> POST /api/{resource}
 *   update(key,id,patch)   更新                -> PUT /api/{resource}/{id}
 *   remove(key,id)         删除                -> DELETE /api/{resource}/{id}
 *   resetAll()             重置                -> POST /api/system/reset
 *   saveSnapshot(data)     保存整份快照（级联用；Http 为空操作，由后端事务保证）
 *   mode                   'local' | 'http'
 */

/** 集合名 -> 后端 REST 路径（Flask 蓝图前缀） */
export const RESOURCE_PATH = {
  classes: 'classes',
  students: 'students',
  teachers: 'teachers',
  adminCourses: 'courses',
  schedule: 'schedules',
}
