/**
 * 成绩导入工具（纯前端，基于 SheetJS）
 *
 * 支持 .xlsx / .xls / .csv
 * 识别列名（中英文别名），按学号优先、姓名其次匹配学生，
 * 返回可导入记录 + 错误清单，供 UI 预览后确认导入。
 */
// SheetJS 体积较大，改为按需动态加载，避免增大首屏包体积
let XLSX = null
async function getXLSX() {
  if (!XLSX) XLSX = await import('xlsx')
  return XLSX
}

/** 列名别名映射（表头 -> 标准字段） */
const HEADER_ALIASES = {
  studentNo: ['学号', '学生学号', '编号', 'studentno', 'studentid', 'sno', 'id'],
  name: ['姓名', '学生姓名', 'name', '学生'],
  score: ['成绩', '分数', '得分', '平均分', 'score', 'grade', 'fraction', 'total'],
  gpa: ['绩点', '平均绩点', 'gpa'],
  className: ['班级', '行政班', 'class', 'classname'],
}

/** 标准化表头：去掉空格、大小写、括号内容 */
function normalizeHeader(h) {
  return String(h ?? '').trim().toLowerCase().replace(/\s/g, '').replace(/（.*?）|\(.*?\)/g, '')
}

/** 从表头识别字段映射 */
function detectColumns(headers) {
  const map = {}
  headers.forEach((h, i) => {
    const n = normalizeHeader(h)
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (map[field] !== undefined) continue
      if (aliases.some((a) => normalizeHeader(a) === n)) {
        map[field] = i
        break
      }
    }
  })
  return map
}

/**
 * 解析文件为行数据
 * @param {File} file
 * @returns {Promise<{headers: string[], rows: any[][], sheetName: string}>}
 */
export async function parseScoreFile(file) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['xlsx', 'xls', 'csv'].includes(ext)) {
    throw new Error('不支持的文件格式，请上传 .xlsx / .xls / .csv 文件')
  }
  const XLSX = await getXLSX()
  const buffer = await file.arrayBuffer()
  // CSV 指定 UTF-8 编码，避免中文乱码
  const workbook = XLSX.read(buffer, {
    type: 'array',
    ...(ext === 'csv' ? { codepage: 65001 } : {}),
  })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) throw new Error('文件中没有找到工作表')
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false })
  if (rows.length < 2) throw new Error('文件中没有数据行（至少需要表头和一条数据）')
  return { headers: rows[0].map(String), rows: rows.slice(1), sheetName }
}

/**
 * 将解析出的行数据匹配到学生，生成预览结果
 * @param {object} parsed parseScoreFile 的结果
 * @param {Array} students 当前学生档案
 * @returns {{ records: Array, matched: number, unmatched: number, invalid: number }}
 */
export function matchStudents(parsed, students, classes = []) {
  const col = detectColumns(parsed.headers)
  if (col.score === undefined) {
    throw new Error('未找到「成绩/分数」列，请检查表头。必需列：学号或姓名 + 成绩')
  }
  if (col.studentNo === undefined && col.name === undefined) {
    throw new Error('未找到「学号」或「姓名」列，至少需要其中一列用于匹配学生')
  }

  const byNo = new Map(students.map((s) => [String(s.studentNo ?? '').trim(), s]))
  const byName = new Map(students.map((s) => [s.name.trim(), s]))
  const records = []

  parsed.rows.forEach((row, idx) => {
    if (!row || row.every((c) => String(c).trim() === '')) return // 跳过空行
    const studentNo = col.studentNo !== undefined ? String(row[col.studentNo] ?? '').trim() : ''
    const name = col.name !== undefined ? String(row[col.name] ?? '').trim() : ''
    const scoreRaw = String(row[col.score] ?? '').trim()
    const score = Number(scoreRaw)

    const base = { row: idx + 2, studentNo, name, scoreRaw, score }

    // 分数校验
    if (scoreRaw === '' || Number.isNaN(score) || score < 0 || score > 100) {
      records.push({ ...base, status: 'invalid', reason: '成绩无效（应为 0-100 的数字）' })
      return
    }
    // 匹配学生：学号优先，姓名其次
    let student = studentNo ? byNo.get(studentNo) : undefined
    if (!student && name) student = byName.get(name)
    if (!student) {
      records.push({ ...base, status: 'unmatched', reason: studentNo ? `学号 ${studentNo} 未匹配到学生` : `姓名「${name}」未匹配到学生` })
      return
    }
    // 计算绩点（百分制换算 4 分制）
    const gpa = Math.round((score / 25) * 10) / 10
    const className = classes.find((c) => c.id === student.classId)?.name ?? '—'
    records.push({
      ...base,
      status: 'matched',
      studentId: student.id,
      matchedName: student.name,
      className,
      oldScore: student.avgScore,
      newScore: score,
      gpa,
    })
  })

  return {
    records,
    matched: records.filter((r) => r.status === 'matched').length,
    unmatched: records.filter((r) => r.status === 'unmatched').length,
    invalid: records.filter((r) => r.status === 'invalid').length,
  }
}

/**
 * 生成导入模板（xlsx），供用户下载填写
 */
export async function downloadTemplate(students) {
  const XLSX = await getXLSX()
  const header = ['学号', '姓名', '成绩', '班级']
  const sample = students.slice(0, 5).map((s) => [
    s.studentNo ?? '', s.name, s.avgScore ?? '', s.major ?? '',
  ])
  const ws = XLSX.utils.aoa_to_sheet([header, ...sample])
  // 设置列宽
  ws['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 10 }, { wch: 20 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '成绩导入')
  XLSX.writeFile(wb, '成绩导入模板.xlsx')
}
