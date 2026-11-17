import { seedData } from '@/data/mock'

const STORAGE_KEY = 'warmclass-data-v1'

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        classes: parsed.classes ?? seedData.classes,
        students: parsed.students ?? seedData.students,
        teachers: parsed.teachers ?? seedData.teachers,
        adminCourses: parsed.adminCourses ?? seedData.adminCourses,
        schedule: parsed.schedule ?? seedData.schedule,
      }
    }
  } catch (e) {
    console.warn('[LocalRepository] 读取失败，回退初始数据', e)
  }
  return structuredClone(seedData)
}

function writeStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('[LocalRepository] 保存失败', e)
  }
}

/** 本地仓储：以 localStorage 模拟后端，方法均为异步以对齐 HttpRepository 契约 */
export class LocalRepository {
  mode = 'local'

  async loadAll() { return readStore() }
  async list(key) { return readStore()[key] }
  async getById(key, id) { return readStore()[key].find((it) => it.id === id) }

  async create(key, item) {
    const data = readStore()
    data[key] = [item, ...data[key]]
    writeStore(data)
    return item
  }

  async update(key, id, patch) {
    const data = readStore()
    let updated
    data[key] = data[key].map((it) => {
      if (it.id !== id) return it
      updated = { ...it, ...patch }
      return updated
    })
    writeStore(data)
    if (!updated) throw new Error(`[LocalRepository] ${key} 中未找到 id=${id}`)
    return updated
  }

  async remove(key, id) {
    const data = readStore()
    data[key] = data[key].filter((it) => it.id !== id)
    writeStore(data)
  }

  async resetAll() {
    const fresh = structuredClone(seedData)
    writeStore(fresh)
    return fresh
  }

  async saveSnapshot(data) { writeStore(data) }
}
