/**
 * Vue 版端到端回归测试
 * 运行前先启动：npm run dev （端口 5174）
 * 运行：node e2e-test.mjs
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:5174'
const results = []
const log = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ' | ' + detail : ''}`)
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext()
const page = await context.newPage()
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message))

// 先设角色
await page.goto(BASE, { waitUntil: 'networkidle' })

try {
  // ---------- 1. 基础渲染 ----------
  await page.evaluate(() => localStorage.setItem('warmclass-role', 'teacher'))
  await page.goto(`${BASE}/?v=t1#/teacher`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const heroOk = await page.locator('.teacher-hero').isVisible().catch(() => false)
  log('教师端概览正常渲染', heroOk)

  // ---------- 2. 数据源标识 + localStorage ----------
  const badge = await page.locator('.ds-badge').first().innerText().catch(() => '')
  log('数据源标识显示本地演示', badge.includes('本地演示'), badge)
  const shape = await page.evaluate(() => {
    const raw = localStorage.getItem('warmclass-data-v1')
    if (!raw) return null
    const d = JSON.parse(raw)
    return { keys: Object.keys(d).sort(), firstClass: d.classes[0]?.name, gpa: d.students[0]?.gpa }
  })
  log('localStorage 数据结构完整', shape?.keys.join(',') === 'adminCourses,classes,schedule,students,teachers', shape?.keys.join(','))
  log('大学语境数据', String(shape?.firstClass).includes('班'), shape?.firstClass)

  // ---------- 3. 图表渲染 ----------
  const charts = await page.locator('canvas').count()
  log('图表 canvas 渲染', charts > 0, `${charts} 个`)

  // ---------- 4. 管理端新增班级 ----------
  await page.evaluate(() => localStorage.setItem('warmclass-role', 'admin'))
  await page.goto(`${BASE}/?v=admin#/admin/classes`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /新增班级/ }).first().click()
  await page.waitForTimeout(300)
  await page.getByPlaceholder('如：计科 2201 班').fill('测试班级A')
  await page.getByPlaceholder('如：数学').fill('计算机科学与技术')
  await page.getByRole('button', { name: /^保存/ }).last().click()
  await page.waitForTimeout(600)
  const added = await page.getByText('测试班级A', { exact: true }).first().isVisible().catch(() => false)
  log('管理端新增班级后可见', added)

  // ---------- 5. 刷新持久化 ----------
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const persisted = await page.getByText('测试班级A', { exact: true }).first().isVisible().catch(() => false)
  log('刷新后班级仍存在（持久化）', persisted)

  // ---------- 6. 跨端共享：教师端可见 ----------
  await page.evaluate(() => localStorage.setItem('warmclass-role', 'teacher'))
  await page.goto(`${BASE}/?v=t2#/teacher/analytics`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const crossRole = await page.getByText('测试班级A', { exact: true }).first().isVisible().catch(() => false)
  log('教师端可见管理端新增班级（跨端共享）', crossRole)

  // ---------- 7. 三端页面均可访问 ----------
  for (const path of ['/teacher/ppt', '/teacher/schedule', '/teacher/grades', '/student', '/student/courses', '/student/homework', '/student/report', '/student/grades', '/admin', '/admin/teachers', '/admin/courses']) {
    await page.goto(BASE + "#" + path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(200)
    const err = await page.locator('body').innerText()
    const ok = !err.includes('Cannot read') && !err.includes('undefined is not')
    log(`页面 ${path} 正常`, ok)
  }

} catch (e) {
  console.log('TEST ERROR:', e.message)
  log('测试执行', false, e.message)
} finally {
  await browser.close()
}

const passed = results.filter((r) => r.ok).length
console.log(`\n===== ${passed}/${results.length} 通过 =====`)
process.exit(passed === results.length ? 0 : 1)
