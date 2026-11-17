// ============ 通用 ============
export const AVATAR_COLORS = ['#F2654C', '#F4C244', '#3AA58F', '#5B8DEF', '#9C6ADE', '#FF9A52']

export function avatarColor(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

export function initials(name) {
  return name.length > 2 ? name.slice(-2) : name
}

// ============ 大学专业/学院常量 ============
export const COLLEGES = ['计算机学院', '数学学院', '外国语学院', '物理学院', '经济管理学院']
export const MAJORS = ['计算机科学与技术', '软件工程', '数学与应用数学', '英语', '物理学', '金融学']
export const SEMESTERS = ['2026-2027学年第一学期', '2026-2027学年第二学期']

// ============ 教师端 · 行政班 ============
export const classes = [
  { id: 'c1', name: '计科 2201 班', subject: '计算机科学与技术', studentCount: 48, avgScore: 86.4, color: '#F2654C', trend: 3.2, college: '计算机学院', major: '计算机科学与技术', grade: '大三', code: 'CS2201' },
  { id: 'c2', name: '软工 2202 班', subject: '软件工程', studentCount: 45, avgScore: 82.7, color: '#F4C244', trend: -1.4, college: '计算机学院', major: '软件工程', grade: '大三', code: 'SE2202' },
  { id: 'c3', name: '数学 2101 班', subject: '数学与应用数学', studentCount: 42, avgScore: 89.1, color: '#3AA58F', trend: 5.6, college: '数学学院', major: '数学与应用数学', grade: '大四', code: 'MA2101' },
  { id: 'c4', name: '计科 2301 班', subject: '计算机科学与技术', studentCount: 46, avgScore: 78.9, color: '#9C6ADE', trend: 1.8, college: '计算机学院', major: '计算机科学与技术', grade: '大二', code: 'CS2301' },
]

// ============ 教师端 · 学生 ============
const studentNames = [
  '林知夏', '陈子墨', '苏念安', '周予怀', '沈星回', '许清和', '顾南溪', '叶书言',
  '陆亦航', '唐可心', '江遇白', '温以宁', '程思远', '韩知意', '宋临川', '白若溪',
  '谢云舟', '洛晓彤', '祁言蹊', '夏栀子', '裴景行', '叶清和', '钟离安', '秦夕颜',
]

const classMeta = {
  c1: { major: '计算机科学与技术', grade: '大三', code: 'CS2201' },
  c3: { major: '数学与应用数学', grade: '大四', code: 'MA2101' },
}

export const students = studentNames.slice(0, 22).map((name, i) => {
  const avgScore = Math.round((68 + ((i * 37) % 31)) * 10) / 10
  const attendance = 72 + ((i * 13) % 28)
  const homeworkRate = 65 + ((i * 17) % 35)
  const participation = 50 + ((i * 23) % 50)
  const trend = Math.round(((i * 7) % 15 - 6) * 10) / 10
  let status = 'good'
  if (avgScore >= 88) status = 'excellent'
  else if (avgScore < 75 || attendance < 80) status = 'warning'
  if (avgScore < 70 && homeworkRate < 75) status = 'risk'
  const classId = i % 2 === 0 ? 'c1' : 'c3'
  const meta = classMeta[classId]
  return {
    id: `s${i + 1}`,
    name,
    avatar: '',
    classId,
    attendance,
    avgScore,
    homeworkRate,
    participation,
    status,
    trend,
    studentNo: `2022${meta.code.slice(2, 4)}${String(i + 1).padStart(3, '0')}`,
    major: meta.major,
    grade: meta.grade,
    gpa: Math.round((avgScore / 25) * 10) / 10, // 百分制换算 4 分绩点
    credits: 60 + ((i * 9) % 60),
  }
})

// ============ 成绩趋势（近 8 次考核） ============
export const scoreTrend = [
  { exam: '第1次测验', '计科2201': 76, '软工2202': 73, 专业均分: 71 },
  { exam: '期中考试', '计科2201': 79, '软工2202': 75, 专业均分: 73 },
  { exam: '第2次测验', '计科2201': 78, '软工2202': 77, 专业均分: 74 },
  { exam: '第3次测验', '计科2201': 82, '软工2202': 76, 专业均分: 75 },
  { exam: '期末考试', '计科2201': 84, '软工2202': 79, 专业均分: 77 },
  { exam: '第4次测验', '计科2201': 85, '软工2202': 81, 专业均分: 78 },
  { exam: '期中考试', '计科2201': 87, '软工2202': 80, 专业均分: 79 },
  { exam: '模拟考核', '计科2201': 86.4, '软工2202': 82.7, 专业均分: 80 },
]

// ============ 分数段分布 ============
export const scoreDistribution = [
  { range: '90-100', count: 8, students: ['林知夏', '沈星回', '程思远'] },
  { range: '80-89', count: 16, students: ['陈子墨', '苏念安', '顾南溪', '陆亦航'] },
  { range: '70-79', count: 14, students: ['周予怀', '许清和', '唐可心'] },
  { range: '60-69', count: 7, students: ['江遇白', '温以宁'] },
  { range: '60以下', count: 3, students: ['谢云舟'] },
]

// ============ 知识点掌握度（大学数据结构与算法课程） ============
export const knowledgePoints = [
  { name: '数据结构基础', mastery: 88, classAvg: 79 },
  { name: '算法复杂度分析', mastery: 92, classAvg: 84 },
  { name: '线性表与树', mastery: 74, classAvg: 81 },
  { name: '图论应用', mastery: 69, classAvg: 77 },
  { name: '动态规划', mastery: 81, classAvg: 75 },
  { name: '操作系统原理', mastery: 85, classAvg: 83 },
  { name: '计算机网络', mastery: 63, classAvg: 72 },
]

// ============ 单次成绩明细 ============
export const scoreRecords = studentNames.slice(0, 12).map((name, i) => ({
  name,
  score: Math.round((62 + ((i * 29) % 38)) * 10) / 10,
  classAvg: 82,
  fullScore: 100,
}))

// ============ 学情雷达 ============
export const radarData = [
  { subject: '知识掌握', value: 86, full: 100 },
  { subject: '作业完成', value: 92, full: 100 },
  { subject: '课堂参与', value: 74, full: 100 },
  { subject: '出勤情况', value: 95, full: 100 },
  { subject: '进步幅度', value: 68, full: 100 },
]

// ============ PPT 主题 ============
export const pptThemes = [
  { id: 'coral', name: '暖阳课堂', colors: ['#F2654C', '#F4C244', '#FFF6F0'], preview: 'linear-gradient(135deg,#F2654C,#F4C244)' },
  { id: 'mint', name: '清新薄荷', colors: ['#3AA58F', '#7FD1BE', '#F0FAF6'], preview: 'linear-gradient(135deg,#3AA58F,#7FD1BE)' },
  { id: 'sky', name: '晴空蓝调', colors: ['#5B8DEF', '#8FB5F5', '#F0F5FF'], preview: 'linear-gradient(135deg,#5B8DEF,#8FB5F5)' },
  { id: 'plum', name: '优雅紫藤', colors: ['#9C6ADE', '#C6A5EC', '#F7F2FD'], preview: 'linear-gradient(135deg,#9C6ADE,#C6A5EC)' },
]

// ============ PPT 默认大纲（大学课程：数据结构） ============
export const defaultOutline = [
  {
    id: 'o1',
    title: '课程导入 · 从问题到数据结构',
    points: ['以社交网络好友关系引入"图"结构', '观察：数据元素之间存在的关系', '提出核心问题：如何高效组织与查询这些数据？'],
  },
  {
    id: 'o2',
    title: '核心概念 · 抽象数据类型（ADT）',
    points: ['ADT 的定义与三要素', '逻辑结构与存储结构的区别', '常见 ADT：线性表、栈、队列、树'],
  },
  {
    id: 'o3',
    title: '重点讲解 · 线性表的实现',
    points: ['顺序存储与链式存储的对比', '时间复杂度分析（插入/删除/查找）', '典型例题精讲（含 3 道变式）'],
  },
  {
    id: 'o4',
    title: '课堂互动 · 随堂编程练习',
    points: ['分层练习：基础 / 提升 / 挑战', '小组协作算法设计与展示', '即时反馈与常见错误纠正'],
  },
  {
    id: 'o5',
    title: '课堂小结 · 知识体系建构',
    points: ['梳理本节课知识脉络', '布置分层课后作业（含编程题）', '预告下一讲：栈与队列的应用'],
  },
]

// ============ 课程安排（一周，大学课程含学分学时） ============
export const weeklyCourses = [
  { id: 'e1', title: '数据结构 · 计科2201', day: 0, start: 1, duration: 2, room: '信息楼 A-301', classId: 'c1', color: '#F2654C', type: 'lecture', code: 'CS201', credits: 4, hours: 64, semester: '2026-2027学年第一学期' },
  { id: 'e2', title: '软件工程 · 软工2202', day: 0, start: 4, duration: 2, room: '信息楼 A-305', classId: 'c2', color: '#F4C244', type: 'lecture', code: 'SE301', credits: 3, hours: 48, semester: '2026-2027学年第一学期' },
  { id: 'e3', title: '算法设计 · 数学2101', day: 1, start: 2, duration: 2, room: '理科楼 B-201', classId: 'c3', color: '#3AA58F', type: 'lecture', code: 'MA302', credits: 4, hours: 64, semester: '2026-2027学年第一学期' },
  { id: 'e4', title: '教研室备课会', day: 1, start: 6, duration: 2, room: '教研室 2', classId: '', color: '#9C6ADE', type: 'seminar' },
  { id: 'e5', title: '数据结构 · 计科2201', day: 2, start: 1, duration: 2, room: '信息楼 A-301', classId: 'c1', color: '#F2654C', type: 'lecture', code: 'CS201', credits: 4, hours: 64, semester: '2026-2027学年第一学期' },
  { id: 'e6', title: '数据结构实验 · 计科2301', day: 2, start: 5, duration: 2, room: '计算机实验中心', classId: 'c4', color: '#5B8DEF', type: 'lab', code: 'CS201L', credits: 1, hours: 32, semester: '2026-2027学年第一学期' },
  { id: 'e7', title: '软件工程 · 软工2202', day: 3, start: 3, duration: 2, room: '信息楼 A-305', classId: 'c2', color: '#F4C244', type: 'lecture', code: 'SE301', credits: 3, hours: 48, semester: '2026-2027学年第一学期' },
  { id: 'e8', title: '算法设计 · 数学2101', day: 3, start: 6, duration: 2, room: '理科楼 B-201', classId: 'c3', color: '#3AA58F', type: 'lecture', code: 'MA302', credits: 4, hours: 64, semester: '2026-2027学年第一学期' },
  { id: 'e9', title: '数据结构 · 阶段测验', day: 4, start: 2, duration: 2, room: '信息楼 A-301', classId: 'c1', color: '#E2543F', type: 'exam', code: 'CS201', credits: 4, hours: 64 },
  { id: 'e10', title: '操作系统 · 计科2301', day: 4, start: 5, duration: 2, room: '信息楼 B-204', classId: 'c4', color: '#9C6ADE', type: 'lecture', code: 'OS301', credits: 4, hours: 64, semester: '2026-2027学年第一学期' },
  { id: 'e11', title: '公开课 · 数据结构专题', day: 5, start: 3, duration: 3, room: '学术报告厅', classId: 'c3', color: '#3AA58F', type: 'seminar' },
]

export const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
export const periodTimes = ['08:00', '08:55', '10:00', '10:55', '14:00', '14:55', '16:00', '16:55']

// ============ 学生端 · 作业 ============
export const homeworks = [
  { id: 'h1', title: '数据结构 · 线性表课后巩固练习', subject: '数据结构', dueDate: '11-18 23:59', status: 'pending', color: '#F2654C' },
  { id: 'h2', title: '算法复杂度分析 专项训练', subject: '算法设计', dueDate: '11-16 23:59', status: 'graded', score: 92, color: '#3AA58F' },
  { id: 'h3', title: '树的遍历 · 分层作业（提升篇）', subject: '数据结构', dueDate: '11-14 23:59', status: 'graded', score: 86, color: '#5B8DEF' },
  { id: 'h4', title: '图的最短路径编程实践', subject: '算法设计', dueDate: '11-20 23:59', status: 'submitted', color: '#9C6ADE' },
  { id: 'h5', title: '操作系统进程调度应用题', subject: '操作系统', dueDate: '11-12 23:59', status: 'graded', score: 78, color: '#F4C244' },
]

// ============ 学生端 · 我的成绩 ============
export const myScores = [
  { exam: '第1次测验', score: 72, classAvg: 71, rank: 22 },
  { exam: '期中考试', score: 78, classAvg: 73, rank: 15 },
  { exam: '第2次测验', score: 75, classAvg: 74, rank: 19 },
  { exam: '第3次测验', score: 83, classAvg: 75, rank: 9 },
  { exam: '期末考试', score: 80, classAvg: 77, rank: 12 },
  { exam: '模拟考核', score: 86, classAvg: 80, rank: 6 },
]

// ============ 管理端 · 学校指标 ============
export const schoolMetrics = [
  { label: '在校本科生', value: '24,860', change: 4.2, icon: 'Users', tone: 'coral' },
  { label: '在职教师', value: '1,680', change: 1.8, icon: 'GraduationCap', tone: 'sky' },
  { label: '教学班', value: '620', change: 0, icon: 'School', tone: 'mint' },
  { label: '本学期课程', value: '1,920', change: 8.6, icon: 'CalendarDays', tone: 'butter' },
]

export const gradeDistribution = [
  { grade: '大一', students: 6860, teachers: 254 },
  { grade: '大二', students: 6812, teachers: 251 },
  { grade: '大三', students: 6124, teachers: 263 },
  { grade: '大四', students: 5064, teachers: 210 },
]

export const recentActivities = [
  { time: '10分钟前', text: '林知夏 提交了《数据结构》课后作业', tone: 'coral' },
  { time: '1小时前', text: '计科2201班 完成阶段测验，均分 86.4', tone: 'mint' },
  { time: '3小时前', text: '王教授 发布了新的课程资源包', tone: 'sky' },
  { time: '昨天 16:20', text: '系统自动生成了大三年级学情周报', tone: 'plum' },
  { time: '昨天 09:15', text: '李讲师 更新了《算法设计》课程安排', tone: 'butter' },
]

// ============ 管理端 · 教师档案（高校职称） ============
export const initialTeachers = [
  { id: 't1', name: '王静怡', subject: '计算机科学与技术', title: '教授', classes: 3, students: 138, years: 12, status: '在职', college: '计算机学院', degree: '博士', research: '分布式系统' },
  { id: 't2', name: '李明远', subject: '数学与应用数学', title: '教授', classes: 2, students: 96, years: 18, status: '在职', college: '数学学院', degree: '博士', research: '应用数学' },
  { id: 't3', name: '陈思雨', subject: '英语', title: '副教授', classes: 4, students: 182, years: 8, status: '在职', college: '外国语学院', degree: '硕士', research: '应用语言学' },
  { id: 't4', name: '赵文博', subject: '物理学', title: '教授', classes: 3, students: 141, years: 14, status: '在职', college: '物理学院', degree: '博士', research: '凝聚态物理' },
  { id: 't5', name: '孙晓彤', subject: '化学', title: '副教授', classes: 2, students: 94, years: 7, status: '教研中', college: '化学学院', degree: '博士', research: '物理化学' },
  { id: 't6', name: '周浩然', subject: '软件工程', title: '讲师', classes: 2, students: 90, years: 3, status: '在职', college: '计算机学院', degree: '硕士', research: '软件架构' },
  { id: 't7', name: '吴佳宁', subject: '计算机科学与技术', title: '副教授', classes: 3, students: 128, years: 11, status: '在职', college: '计算机学院', degree: '博士', research: '人工智能' },
  { id: 't8', name: '郑一诺', subject: '金融学', title: '讲师', classes: 2, students: 87, years: 6, status: '请假', college: '经济管理学院', degree: '硕士', research: '金融科技' },
  { id: 't9', name: '黄梓涵', subject: '英语', title: '助教', classes: 2, students: 88, years: 2, status: '在职', college: '外国语学院', degree: '硕士', research: '翻译理论' },
  { id: 't10', name: '徐立诚', subject: '计算机科学与技术', title: '教授', classes: 3, students: 135, years: 16, status: '在职', college: '计算机学院', degree: '博士', research: '计算机网络' },
]

// ============ 管理端 · 全校课程（含学分/学时/学期） ============
export const initialAdminCourses = [
  { id: 'k1', title: '数据结构与算法', teacher: '王静怡', className: '计科 2201 班', day: 0, start: 1, duration: 2, room: '信息楼 A-301', type: 'lecture', status: '已完成', color: '#F2654C', code: 'CS201', credits: 4, hours: 64, semester: '2026-2027学年第一学期' },
  { id: 'k2', title: '软件工程导论', teacher: '周浩然', className: '软工 2202 班', day: 0, start: 4, duration: 2, room: '信息楼 A-305', type: 'lecture', status: '进行中', color: '#F4C244', code: 'SE301', credits: 3, hours: 48, semester: '2026-2027学年第一学期' },
  { id: 'k3', title: '算法设计与分析', teacher: '赵文博', className: '数学 2101 班', day: 1, start: 2, duration: 2, room: '理科楼 B-201', type: 'lecture', status: '待开课', color: '#5B8DEF', code: 'MA302', credits: 4, hours: 64, semester: '2026-2027学年第一学期' },
  { id: 'k4', title: '计算机学院教研备课会', teacher: '徐立诚', className: '—', day: 1, start: 6, duration: 2, room: '教研室 2', type: 'seminar', status: '已完成', color: '#9C6ADE' },
  { id: 'k5', title: '数据结构与算法', teacher: '王静怡', className: '计科 2201 班', day: 2, start: 1, duration: 2, room: '信息楼 A-301', type: 'lecture', status: '进行中', color: '#F2654C', code: 'CS201', credits: 4, hours: 64, semester: '2026-2027学年第一学期' },
  { id: 'k6', title: '数据结构实验', teacher: '吴佳宁', className: '计科 2301 班', day: 2, start: 5, duration: 2, room: '计算机实验中心', type: 'lab', status: '待开课', color: '#5B8DEF', code: 'CS201L', credits: 1, hours: 32, semester: '2026-2027学年第一学期' },
  { id: 'k7', title: '大学英语（三）', teacher: '陈思雨', className: '软工 2202 班', day: 3, start: 3, duration: 2, room: '外语楼 A-305', type: 'lecture', status: '进行中', color: '#F4C244', code: 'EN203', credits: 2, hours: 32, semester: '2026-2027学年第一学期' },
  { id: 'k8', title: '公开课 · 数据结构专题', teacher: '李明远', className: '数学 2101 班', day: 3, start: 6, duration: 2, room: '学术报告厅', type: 'seminar', status: '待开课', color: '#9C6ADE' },
  { id: 'k9', title: '数据结构阶段测验', teacher: '王静怡', className: '计科 2201 班', day: 4, start: 2, duration: 2, room: '信息楼 A-301', type: 'exam', status: '待开课', color: '#E2543F', code: 'CS201', credits: 4, hours: 64 },
  { id: 'k10', title: '操作系统原理', teacher: '徐立诚', className: '计科 2301 班', day: 4, start: 5, duration: 2, room: '信息楼 B-204', type: 'lecture', status: '进行中', color: '#9C6ADE', code: 'OS301', credits: 4, hours: 64, semester: '2026-2027学年第一学期' },
  { id: 'k11', title: '学术论文写作', teacher: '黄梓涵', className: '数学 2101 班', day: 2, start: 7, duration: 1, room: '文科楼 B-201', type: 'lecture', status: '待开课', color: '#3AA58F', code: 'GE205', credits: 1, hours: 16, semester: '2026-2027学年第一学期' },
  { id: 'k12', title: '计算机网络实验', teacher: '徐立诚', className: '计科 2201 班', day: 0, start: 7, duration: 1, room: '网络实验中心', type: 'lab', status: '已完成', color: '#5B8DEF', code: 'CN301L', credits: 1, hours: 32, semester: '2026-2027学年第一学期' },
]

// ============ 初始数据集（供 Repository 种子/重置使用） ============
export const seedData = {
  classes,
  students,
  teachers: initialTeachers,
  adminCourses: initialAdminCourses,
  schedule: weeklyCourses,
}
