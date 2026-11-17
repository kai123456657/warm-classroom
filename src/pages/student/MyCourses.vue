<script setup>
/**
 * 学生端 · 我的课程
 * 迁移自 React student/MyCourses.tsx
 * 课程数据为组件内本地数组，使用 ref 承载（含展开详情与学期筛选）
 */
import { computed, ref } from 'vue'
import {
  Atom, BookOpen, Calculator, CalendarDays, CheckCircle2, ChevronDown,
  ChevronRight, Dna, FlaskConical, Globe2, GraduationCap, Languages,
  Layers, Play, Users,
} from 'lucide-vue-next'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import Badge from '@/components/ui/Badge.vue'
import '@/styles/student.css'

const courses = ref([
  {
    id: 'c1', name: '数据结构', teacher: '王明远 教授', progress: 72, color: '#F2654C', soft: '#FDE9E3', credits: 4,
    chapters: 18, finished: 13, semester: 'this', icon: BookOpen,
    desc: '研究数据的组织、存储与运算，为算法设计与系统开发打下坚实基础。',
    next: '周三 08:00 · 线性表的顺序存储',
    topics: ['数据结构基本概念', '线性表与栈队列', '树与二叉树', '图的基本应用'],
  },
  {
    id: 'c2', name: '算法设计', teacher: '李静 副教授', progress: 85, color: '#5B8DEF', soft: '#E7EFF', credits: 4,
    chapters: 24, finished: 20, semester: 'this', icon: Calculator,
    desc: '从复杂度分析到动态规划，训练严谨的算法思维与编程实现能力。',
    next: '周三 10:00 · 贪心算法与复杂度分析',
    topics: ['算法复杂度分析', '递归与分治', '贪心算法', '动态规划', '图论算法'],
  },
  {
    id: 'c3', name: '大学英语', teacher: '陈思雨 老师', progress: 64, color: '#3AA58F', soft: '#E0F0EA', credits: 2,
    chapters: 20, finished: 13, semester: 'this', icon: Languages,
    desc: '提升学术英语听说读写能力，助力文献阅读与国际交流。',
    next: '周四 14:00 · 学术阅读与写作',
    topics: ['核心词汇巩固', '长难句解析', '学术阅读专项', '英语写作模板'],
  },
  {
    id: 'c4', name: '操作系统', teacher: '徐立诚 教授', progress: 58, color: '#9C6ADE', soft: '#F0E9FB', credits: 4,
    chapters: 16, finished: 9, semester: 'this', icon: Atom,
    desc: '理解进程、内存与文件系统的设计原理，贯通软硬件协同工作机制。',
    next: '周四 16:00 · 进程调度实验',
    topics: ['进程与线程', '处理机调度', '内存管理', '文件系统'],
  },
  {
    id: 'c5', name: '计算机网络', teacher: '吴佳宁 副教授', progress: 76, color: '#FF9A52', soft: '#FFF0E1', credits: 3,
    chapters: 14, finished: 11, semester: 'this', icon: FlaskConical,
    desc: '从网络体系结构到应用层协议，构建系统的网络知识体系。',
    next: '周五 10:00 · TCP 协议与拥塞控制',
    topics: ['网络体系结构', '数据链路层', '网络层与路由', '传输层协议'],
  },
  {
    id: 'c6', name: '软件工程', teacher: '周浩然 讲师', progress: 69, color: '#F4C244', soft: '#FDF4D8', credits: 3,
    chapters: 15, finished: 10, semester: 'this', icon: Dna,
    desc: '覆盖需求、设计、测试与维护全过程，实践团队协作开发流程。',
    next: '周五 14:00 · UML 建模与用例分析',
    topics: ['软件生命周期', '需求工程', 'UML 建模', '软件测试', '项目管理'],
  },
  {
    id: 'c7', name: '数据库系统', teacher: '王静怡 教授', progress: 100, color: '#5B8DEF', soft: '#E7EFF', credits: 3,
    chapters: 16, finished: 16, semester: 'last', icon: BookOpen,
    desc: '系统掌握关系模型与 SQL，理解数据库设计与事务管理核心原理。',
    next: '已结课',
    topics: ['关系模型', 'SQL 与查询优化', '数据库设计', '事务与并发控制'],
  },
  {
    id: 'c8', name: '高等数学', teacher: '李明远 教授', progress: 100, color: '#3AA58F', soft: '#E0F0EA', credits: 5,
    chapters: 14, finished: 14, semester: 'last', icon: Globe2,
    desc: '夯实数学基础，为专业课程与科研训练提供理论支撑。',
    next: '已结课',
    topics: ['极限与连续', '一元函数微分学', '积分学', '级数'],
  },
])

const semester = ref('this')
const openId = ref(null)

const visible = computed(() => courses.value.filter((c) => c.semester === semester.value))
const finishedTotal = computed(() => visible.value.reduce((sum, c) => sum + c.finished, 0))
const avgProgress = computed(() =>
  Math.round(visible.value.reduce((sum, c) => sum + c.progress, 0) / (visible.value.length || 1)),
)

function switchSemester(value) {
  semester.value = value
  openId.value = null
}
function toggleOpen(id) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <div class="stu-page">
    <div>
      <SectionTitle eyebrow="MY COURSES · 我的课程" title="我的课程" desc="每一门课，都是通向更好自己的一段路">
        <template #action>
          <div class="stu-segmented">
            <button :class="semester === 'this' ? 'active' : ''" @click="switchSemester('this')">
              <GraduationCap :size="15" /> 本学期
            </button>
            <button :class="semester === 'last' ? 'active' : ''" @click="switchSemester('last')">
              <GraduationCap :size="15" /> 上学期
            </button>
          </div>
        </template>
      </SectionTitle>
    </div>

    <div class="stu-course-summary">
      <div><strong class="display">{{ visible.length }}</strong><span>门课程</span></div>
      <div><strong class="display">{{ finishedTotal }}</strong><span>已学章节</span></div>
      <div><strong class="display">{{ avgProgress }}%</strong><span>平均进度</span></div>
    </div>

    <div class="stu-course-grid">
      <article
        v-for="c in visible"
        :key="c.id"
        class="card stu-course"
        :class="{ 'stu-course--open': openId === c.id }"
        :style="{ '--course-color': c.color, '--course-soft': c.soft }"
      >
        <button class="stu-course__head" :aria-expanded="openId === c.id" @click="toggleOpen(c.id)">
          <span class="stu-course__icon"><component :is="c.icon" :size="24" :stroke-width="2" /></span>
          <span class="stu-course__heading">
            <strong class="display">{{ c.name }}</strong>
            <span>{{ c.teacher }}</span>
          </span>
          <ChevronDown :size="18" class="stu-course__chev" :class="{ flip: openId === c.id }" />
        </button>

        <div class="stu-course__meta">
          <span><Layers :size="14" /> {{ c.finished }}/{{ c.chapters }} 章节</span>
          <span><GraduationCap :size="14" /> {{ c.credits }} 学分</span>
          <Badge :tone="c.semester === 'this' ? 'coral' : 'mint'">
            {{ c.semester === 'this' ? '学习中' : '已结课' }}
          </Badge>
        </div>

        <div class="stu-course__progress">
          <ProgressBar :value="c.progress" :color="c.color" :height="8" show-label />
        </div>

        <div v-if="openId === c.id" class="stu-course-detail">
          <p class="stu-course-detail__desc">{{ c.desc }}</p>
          <div class="stu-course-detail__info">
            <span><Users :size="14" /> {{ c.teacher }}</span>
            <span><CalendarDays :size="14" /> {{ c.next }}</span>
          </div>
          <div class="stu-course-detail__topics">
            <div class="stu-course-detail__topics-h">章节目录</div>
            <div v-for="(t, i) in c.topics" :key="t" class="stu-course-detail__topic">
              <CheckCircle2 v-if="i < c.finished" :size="15" class="stu-topic-done" />
              <span v-else class="stu-topic-dot" />
              <span>{{ t }}</span>
              <ChevronRight :size="14" />
            </div>
          </div>
          <button class="btn btn-primary stu-course-detail__btn">
            <Play :size="15" fill="currentColor" /> 继续学习
          </button>
        </div>
      </article>
    </div>
  </div>
</template>
