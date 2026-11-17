/**
 * 数据源配置 —— 前后端分离的关键开关
 *
 * 在 .env.local 中设置（见 .env.example）：
 *   VITE_DATA_SOURCE=http
 *   VITE_API_BASE_URL=https://your-api.example.com/api
 */
const rawMode = import.meta.env.VITE_DATA_SOURCE
export const DATA_SOURCE = rawMode === 'http' ? 'http' : 'local'

const rawBase = import.meta.env.VITE_API_BASE_URL
export const API_BASE_URL = (rawBase ?? '/api').replace(/\/$/, '')

export const API_TIMEOUT = 15000
export const API_DEBUG = import.meta.env.DEV
