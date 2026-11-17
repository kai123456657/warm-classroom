<script setup>
/**
 * 教师端 · 智能生成课件（Vue 版）
 * 对照 React 版 PptGenerator.tsx 迁移：主题配置 / 视觉风格 / 多阶段生成动画 /
 * 幻灯片预览（封面+大纲页）/ 缩略图切换 / 大纲要点编辑 / 真实 pptx 导出。
 */
import { ref, computed, onUnmounted } from 'vue'
import {
  Sparkles, WandSparkles, Presentation, Download, Check, Loader2,
  RotateCcw, Plus, Trash2, GripVertical, Palette, Type, CheckCircle2, Layers,
} from 'lucide-vue-next'
import { pptThemes, defaultOutline } from '@/data/mock'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import Badge from '@/components/ui/Badge.vue'
import Toast from '@/components/ui/Toast.vue'
import '@/styles/teacher.css'

const topicSuggestions = ['数据结构与算法', '操作系统原理', '计算机网络', '数据库系统', '编译原理']

const stageSteps = [
  { key: 'analyzing', label: '分析主题与教学目标', desc: '理解课程重点与难点' },
  { key: 'outlining', label: '构建智能大纲结构', desc: '规划知识呈现逻辑' },
  { key: 'designing', label: '匹配视觉设计风格', desc: '生成版式与配色' },
  { key: 'done', label: '课件生成完成', desc: '共计 7 页幻灯片' },
]

const stageOrder = ['idle', 'analyzing', 'outlining', 'designing', 'done']

const topic = ref('数据结构与算法')
const description = ref('面向计算机专业本科生，重点讲解线性表的概念、存储结构与基本操作，结合编程实例，包含课堂练习环节。')
const grade = ref('大学二年级')
const themeId = ref('coral')
const stage = ref('idle')
const outline = ref([])
const activeSlide = ref(0)
const exporting = ref(false)
const toast = ref('')
let timers = []

const theme = computed(() => pptThemes.find((t) => t.id === themeId.value))
const isGenerating = computed(() => stage.value !== 'idle' && stage.value !== 'done')
const stageIndex = computed(() => stageOrder.indexOf(stage.value))
const current = computed(() => outline.value[activeSlide.value])

onUnmounted(() => timers.forEach(clearTimeout))

function pushTimer(fn, delay) {
  timers.push(window.setTimeout(fn, delay))
}

function startGenerate() {
  if (!topic.value.trim() || isGenerating.value) return
  timers.forEach(clearTimeout)
  timers = []
  outline.value = []
  activeSlide.value = 0
  stage.value = 'analyzing'

  pushTimer(() => { stage.value = 'outlining' }, 1100)
  pushTimer(() => {
    outline.value = defaultOutline.map((o) => ({ ...o }))
    stage.value = 'designing'
  }, 2400)
  pushTimer(() => { stage.value = 'done' }, 3600)
}

function updatePoint(itemId, pointIdx, value) {
  outline.value = outline.value.map((o) => o.id === itemId
    ? { ...o, points: o.points.map((p, i) => (i === pointIdx ? value : p)) }
    : o)
}
function addPoint(itemId) {
  outline.value = outline.value.map((o) => o.id === itemId ? { ...o, points: [...o.points, '新的知识点'] } : o)
}
function removePoint(itemId, pointIdx) {
  outline.value = outline.value.map((o) => o.id === itemId ? { ...o, points: o.points.filter((_, i) => i !== pointIdx) } : o)
}
function resetAll() {
  timers.forEach(clearTimeout)
  stage.value = 'idle'
  outline.value = []
  activeSlide.value = 0
}

async function handleExport() {
  if (outline.value.length === 0) return
  exporting.value = true
  try {
    const { exportPpt } = await import('@/utils/pptExport')
    await exportPpt(topic.value, outline.value, theme.value)
    toast.value = '课件已成功导出为 .pptx 文件'
  } catch (e) {
    console.error(e)
    toast.value = '导出失败，请重试'
  } finally {
    exporting.value = false
    window.setTimeout(() => { toast.value = '' }, 3000)
  }
}
</script>

<template>
  <div>
    <SectionTitle
      eyebrow="AI TEACHING ASSISTANT"
      title="智能生成课件"
      desc="输入课程主题，AI 自动构建教学大纲、匹配视觉风格，一键导出可编辑的 PPT 课件。"
    >
      <template #action>
        <Badge tone="mint"><Sparkles :size="12" /> 支持真实导出 .pptx</Badge>
      </template>
    </SectionTitle>

    <div class="ppt-layout">
      <!-- 左：配置面板 -->
      <div class="ppt-config">
        <div class="ppt-config-card">
          <div class="panel__title" style="margin-bottom: 18">
            <span class="ttl-icon" style="background: var(--coral-soft); color: var(--coral)"><WandSparkles :size="17" /></span>
            课程内容设置
          </div>

          <label class="field-label">课程主题 <span class="field-hint">必填</span></label>
          <input v-model="topic" class="ppt-input" placeholder="例如：数据结构与算法" :disabled="isGenerating" />
          <div class="chip-row" style="margin: 10px 0 20px">
            <button
              v-for="s in topicSuggestions"
              :key="s"
              class="chip"
              :class="{ 'chip--active': topic === s }"
              :disabled="isGenerating"
              @click="topic = s"
            >{{ s }}</button>
          </div>

          <label class="field-label">教学目标与要求 <span class="field-hint">选填</span></label>
          <textarea
            v-model="description"
            class="ppt-input ppt-textarea"
            placeholder="描述你的教学目标、重点难点、期望的课堂互动…"
            :disabled="isGenerating"
          />

          <label class="field-label" style="margin-top: 18">适用年级</label>
          <select v-model="grade" class="ppt-select" :disabled="isGenerating">
            <option>大学一年级</option>
            <option>大学二年级</option>
            <option>大学三年级</option>
            <option>大学四年级</option>
            <option>研究生</option>
          </select>
        </div>

        <div class="ppt-config-card">
          <div class="panel__title" style="margin-bottom: 16">
            <span class="ttl-icon" style="background: var(--plum-soft); color: var(--plum)"><Palette :size="17" /></span>
            选择视觉风格
          </div>
          <div class="ppt-themes">
            <button
              v-for="t in pptThemes"
              :key="t.id"
              class="ppt-theme"
              :class="{ 'ppt-theme--active': themeId === t.id }"
              :aria-label="t.name"
              @click="themeId = t.id"
            >
              <div class="ppt-theme__swatch" :style="{ background: t.preview }" />
              <div class="ppt-theme__name">{{ t.name }}</div>
            </button>
          </div>
        </div>

        <!-- 生成进度 -->
        <Transition name="fade">
          <div v-if="stage !== 'idle'" class="ppt-config-card">
            <div class="panel__title" style="margin-bottom: 6">
              <span class="ttl-icon" style="background: var(--mint-soft); color: var(--mint)"><Layers :size="17" /></span>
              生成进度
            </div>
            <div class="gen-progress">
              <div
                v-for="(s, i) in stageSteps"
                :key="s.key"
                class="gen-step"
                :class="{ 'gen-step--active': stage === s.key, 'gen-step--done': stageIndex > stageOrder.indexOf(s.key) }"
              >
                <div class="gen-step__icon">
                  <Check v-if="stageIndex > stageOrder.indexOf(s.key)" :size="16" />
                  <div v-else-if="stage === s.key" class="gen-step__spinner" />
                  <span v-else style="font-size: 0.72rem">{{ i + 1 }}</span>
                </div>
                <div>
                  <div>{{ s.label }}</div>
                  <div style="font-size: 0.68rem; font-weight: 500; opacity: 0.7">{{ s.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <button
          class="btn btn-primary"
          :disabled="!topic.trim() || isGenerating"
          style="width: 100%; height: 48px"
          @click="startGenerate"
        >
          <template v-if="isGenerating"><Loader2 :size="18" class="spin" /> 正在智能生成…</template>
          <template v-else-if="stage === 'done'"><RotateCcw :size="18" /> 重新生成</template>
          <template v-else><Sparkles :size="18" /> 开始智能生成</template>
        </button>
      </div>

      <!-- 右：预览区 -->
      <div>
        <div class="ppt-preview-head">
          <div class="panel__title">
            <span class="ttl-icon" style="background: var(--sky-soft); color: var(--sky)"><Presentation :size="17" /></span>
            课件预览
            <span v-if="stage === 'done'" class="badge badge--mint" style="margin-left: 4px">生成完成</span>
          </div>
          <div v-if="stage === 'done'" style="display: flex; gap: 10">
            <button class="btn btn-ghost" @click="resetAll"><RotateCcw :size="15" /> 重置</button>
            <button class="btn btn-primary" :disabled="exporting" @click="handleExport">
              <Loader2 v-if="exporting" :size="16" class="spin" />
              <Download v-else :size="16" /> 导出 PPT
            </button>
          </div>
        </div>

        <div class="ppt-stage">
          <Transition name="fade" mode="out-in">
            <!-- 空状态 -->
            <div v-if="stage === 'idle'" key="empty" class="ppt-empty-preview">
              <div>
                <div class="ppt-empty-preview__icon"><Presentation :size="40" :stroke-width="1.4" /></div>
                <h3 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 8px">你的课件将在这里呈现</h3>
                <p style="font-size: 0.86rem; max-width: 340px; line-height: 1.7">
                  在左侧填写课程主题，点击「开始智能生成」，AI 将为你构建大纲并生成精美课件。
                </p>
              </div>
            </div>

            <!-- 生成中 -->
            <div v-else-if="stage !== 'done' && outline.length === 0" key="loading" class="ppt-empty-preview">
              <div style="text-align: center">
                <div class="gen-loading-ring">
                  <Sparkles :size="34" />
                </div>
                <h3 style="font-family: var(--font-display); font-size: 1.4rem; margin-bottom: 6px">AI 正在构思课件…</h3>
                <p style="font-size: 0.84rem">{{ stageSteps.find((s) => s.key === stage)?.desc }}</p>
              </div>
            </div>

            <!-- 幻灯片预览 -->
            <div v-else-if="current" key="slides">
              <Transition name="slide" mode="out-in">
                <div :key="activeSlide" class="slide-canvas">
                  <div class="slide-canvas__bar" :style="{ background: theme.colors[0] }" />
                  <div class="slide-canvas__eyebrow" :style="{ color: theme.colors[0] }">
                    {{ activeSlide === 0 ? 'WARM CLASSROOM · 课件封面' : `PART ${String(activeSlide).padStart(2, '0')}` }}
                  </div>
                  <template v-if="activeSlide === 0">
                    <h2 class="slide-canvas__title" style="color: var(--ink); font-size: 2.6rem; margin-top: 2.4rem">{{ topic }}</h2>
                    <p style="color: var(--ink-2); font-size: 1rem; max-width: 70%">{{ description }}</p>
                    <div class="slide-canvas__footer">
                      <span>主讲教师：王明远</span>
                      <span>{{ grade }} · 暖课堂</span>
                    </div>
                  </template>
                  <template v-else>
                    <h2 class="slide-canvas__title" style="color: var(--ink)">{{ current.title }}</h2>
                    <div class="slide-canvas__list">
                      <div v-for="(p, i) in current.points" :key="i" class="slide-canvas__point">
                        <span class="slide-canvas__num" :style="{ background: i % 2 === 0 ? theme.colors[0] : theme.colors[1] }">{{ i + 1 }}</span>
                        <span>{{ p }}</span>
                      </div>
                    </div>
                    <div class="slide-canvas__footer">
                      <span>{{ topic }}</span>
                      <span>{{ activeSlide + 1 }} / {{ outline.length + 1 }}</span>
                    </div>
                  </template>
                </div>
              </Transition>

              <!-- 缩略图 -->
              <div class="slide-thumbs">
                <button
                  class="slide-thumb"
                  :class="{ 'slide-thumb--active': activeSlide === 0 }"
                  :style="{ background: theme.colors[2] }"
                  @click="activeSlide = 0"
                >
                  <span class="slide-thumb__bar" :style="{ background: theme.colors[0] }" />
                  <span class="slide-thumb__title" style="color: var(--ink); margin-left: 5px">{{ topic }}</span>
                  <span class="slide-thumb__idx" :style="{ color: theme.colors[0] }">0</span>
                </button>
                <button
                  v-for="(o, i) in outline"
                  :key="o.id"
                  class="slide-thumb"
                  :class="{ 'slide-thumb--active': activeSlide === i + 1 }"
                  @click="activeSlide = i + 1"
                >
                  <span class="slide-thumb__bar" :style="{ background: theme.colors[0] }" />
                  <span class="slide-thumb__title" style="color: var(--ink); margin-left: 5px">{{ o.title }}</span>
                  <span class="slide-thumb__idx" :style="{ color: theme.colors[0] }">{{ i + 1 }}</span>
                </button>
              </div>

              <!-- 大纲编辑 -->
              <Transition name="fade">
                <div v-if="stage === 'done' && activeSlide > 0" class="panel" style="margin-top: 16px; padding: 18px">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px">
                    <div class="panel__title" style="font-size: 0.92rem">
                      <Type :size="16" /> 编辑本页大纲
                    </div>
                    <span class="badge badge--coral">可编辑</span>
                  </div>
                  <div v-for="(p, i) in current.points" :key="i" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center">
                    <GripVertical :size="15" style="color: var(--ink-3); flex-shrink: 0" />
                    <input
                      class="ppt-input"
                      style="padding: 9px 12px; font-size: 0.82rem"
                      :value="p"
                      @input="updatePoint(current.id, i, $event.target.value)"
                    />
                    <button class="modal-close" aria-label="删除" @click="removePoint(current.id, i)"><Trash2 :size="14" /></button>
                  </div>
                  <button class="chip" style="display: inline-flex; align-items: center; gap: 6px; margin-top: 4px" @click="addPoint(current.id)">
                    <Plus :size="13" /> 添加要点
                  </button>
                </div>
              </Transition>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <Toast v-if="toast" :message="toast" />
  </div>
</template>

<style scoped>
.gen-loading-ring {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, var(--coral), var(--tangerine));
  display: grid; place-items: center; margin: 0 auto 20px; color: #fff;
  animation: gen-spin 2s linear infinite;
}
@keyframes gen-spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.slide-enter-from { opacity: 0; transform: translateX(24px) scale(0.98); }
.slide-leave-to { opacity: 0; transform: translateX(-24px) scale(0.98); }
</style>
