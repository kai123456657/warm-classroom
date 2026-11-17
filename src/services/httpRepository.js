import { RESOURCE_PATH } from './repository'
import { API_BASE_URL, API_TIMEOUT, API_DEBUG, DATA_SOURCE } from './config'
import { LocalRepository } from './localRepository'

/** 业务错误：后端已响应但拒绝请求（如时段冲突），应透传到 UI，不可回退本地 */
export class ApiBusinessError extends Error {
  constructor(message, code, status) {
    super(message)
    this.name = 'ApiBusinessError'
    this.code = code
    this.status = status
  }
}

/**
 * HTTP 仓储：调用真实 Flask 后端 REST API（契约见 docs/API.md）。
 * 容错：网络不可达/5xx/超时 -> 回退本地；4xx 业务错误 -> 透传 UI。
 */
export class HttpRepository {
  mode = 'http'
  fallback = new LocalRepository()

  async request(path, options) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT)
    const url = `${API_BASE_URL}${path}`
    if (API_DEBUG) console.log(`[HttpRepository] ${options?.method ?? 'GET'} ${url}`)
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
        credentials: 'include',
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const code = json?.code ?? res.status
        const message = json?.message || `HTTP ${res.status} ${res.statusText}`
        if (res.status >= 400 && res.status < 500) throw new ApiBusinessError(message, code, res.status)
        throw new Error(message)
      }
      if (!json) throw new Error('后端返回空响应')
      if (json.code !== 0) throw new ApiBusinessError(json.message || '后端返回错误', json.code, res.status)
      return json.data
    } finally {
      clearTimeout(timer)
    }
  }

  async withFallback(fn, fallback) {
    try {
      return await fn()
    } catch (e) {
      if (e instanceof ApiBusinessError) throw e
      console.warn('[HttpRepository] 后端不可用，回退本地数据：', e)
      return fallback()
    }
  }

  loadAll() { return this.withFallback(() => this.request('/bootstrap'), () => this.fallback.loadAll()) }
  list(key) { return this.withFallback(() => this.request(`/${RESOURCE_PATH[key]}`), () => this.fallback.list(key)) }
  getById(key, id) { return this.withFallback(() => this.request(`/${RESOURCE_PATH[key]}/${id}`), () => this.fallback.getById(key, id)) }
  create(key, item) { return this.withFallback(() => this.request(`/${RESOURCE_PATH[key]}`, { method: 'POST', body: JSON.stringify(item) }), () => this.fallback.create(key, item)) }
  update(key, id, patch) { return this.withFallback(() => this.request(`/${RESOURCE_PATH[key]}/${id}`, { method: 'PUT', body: JSON.stringify(patch) }), () => this.fallback.update(key, id, patch)) }
  remove(key, id) { return this.withFallback(() => this.request(`/${RESOURCE_PATH[key]}/${id}`, { method: 'DELETE' }), () => this.fallback.remove(key, id)) }
  resetAll() { return this.withFallback(() => this.request('/system/reset', { method: 'POST' }), () => this.fallback.resetAll()) }
  async saveSnapshot() { /* HTTP 模式由后端事务保证级联，无需整体写入 */ }
}

/** 根据配置创建仓储实例 */
export function createRepository() {
  return DATA_SOURCE === 'http' ? new HttpRepository() : new LocalRepository()
}
