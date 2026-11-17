/**
 * 成绩导入功能端到端测试
 * 运行：node e2e-import-test.mjs
 * 覆盖：上传 CSV -> 解析预览 -> 匹配统计 -> 确认导入 -> 学生分数更新且持久化
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

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

try {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.setItem('warmclass-role', 'teacher'))

  // 读取当前学生数据，构造测试 CSV（用真实学号，含1条不匹配+1条无效）
  await page.goto(`${BASE}/?v=import#/teacher/grades`, { waitUntil: 'networkidle' })
  const students = await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('warmclass-data-v1'))
    return d.students.slice(0, 3)
  })
  log('获取测试学生数据', students.length >= 3, `${students.length} 名`)

  const target = students[0]
  const csvContent = [
    '学号,姓名,成绩,班级',
    `${target.studentNo},${target.name},95,计算机科学与技术`,
    `${students[1].studentNo},${students[1].name},88,计算机科学与技术`,
    'STU999999,不存在的人,77,测试班',
    `${students[2].studentNo},${students[2].name},150,计算机科学与技术`,
  ].join('\n')
  const csvPath = path.join(process.cwd(), 'test-scores.csv')
  fs.writeFileSync(csvPath, '\uFEFF' + csvContent, 'utf-8') // BOM 保证 Excel/中文兼容

  // 打开导入弹窗
  await page.getByRole('button', { name: /导入成绩/ }).click()
  await page.waitForTimeout(300)
  const modalVisible = await page.locator('.import-modal').isVisible().catch(() => false)
  log('导入弹窗打开', modalVisible)

  // 上传 CSV
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(csvPath)
  await page.waitForTimeout(800)

  // 验证预览统计：2 匹配 + 1 未匹配 + 1 无效
  const summary = await page.locator('.import-summary').innerText().catch(() => '')
  log('预览统计显示', summary.includes('匹配成功') && summary.includes('未匹配') && summary.includes('无效'), summary.replace(/\n/g, ' '))

  const matchedCount = await page.locator('.import-row--matched').count()
  const unmatchedCount = await page.locator('.import-row--unmatched').count()
  const invalidCount = await page.locator('.import-row--invalid').count()
  log('匹配记录数正确', matchedCount === 2, `matched=${matchedCount}`)
  log('未匹配记录数正确', unmatchedCount === 1, `unmatched=${unmatchedCount}`)
  log('无效记录数正确', invalidCount === 1, `invalid=${invalidCount}`)

  // 确认导入
  const confirmBtn = page.getByRole('button', { name: /确认导入/ })
  const btnEnabled = await confirmBtn.isEnabled()
  log('确认按钮可用', btnEnabled)
  await confirmBtn.click()
  await page.waitForTimeout(600)

  // 验证学生分数已更新
  const updated = await page.evaluate((sid) => {
    const d = JSON.parse(localStorage.getItem('warmclass-data-v1'))
    const s = d.students.find((x) => x.id === sid)
    return s ? { score: s.avgScore, gpa: s.gpa } : null
  }, target.id)
  log('学生分数已更新为95', updated?.score === 95, JSON.stringify(updated))
  log('绩点已同步更新', updated?.gpa === 3.8, `gpa=${updated?.gpa}`)

  // 刷新后仍存在（持久化）
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const persisted = await page.evaluate((sid) => {
    const d = JSON.parse(localStorage.getItem('warmclass-data-v1'))
    return d.students.find((x) => x.id === sid)?.avgScore
  }, target.id)
  log('导入结果持久化', persisted === 95, `score=${persisted}`)

  // 明细表显示更新后的分数
  const tableHas95 = await page.locator('.score-table').innerText().then(t => t.includes('95')).catch(() => false)
  log('成绩明细表显示新分数', tableHas95)

  // 清理测试文件
  fs.unlinkSync(csvPath)

} catch (e) {
  console.log('TEST ERROR:', e.message)
  log('测试执行', false, e.message)
} finally {
  await browser.close()
}

const passed = results.filter((r) => r.ok).length
console.log(`\n===== ${passed}/${results.length} 通过 =====`)
process.exit(passed === results.length ? 0 : 1)
