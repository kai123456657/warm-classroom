<script setup>
/**
 * ECharts 图表封装组件
 * 用法：<VChart :option="chartOption" height="280px" />
 * option 是标准 ECharts 配置对象，比 Recharts 更直观。
 */
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  LineChart, BarChart, PieChart, RadarChart,
} from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, MarkLineComponent,
} from 'echarts/components'
import ECharts from 'vue-echarts'

// 按需注册（减小打包体积）
use([
  CanvasRenderer,
  LineChart, BarChart, PieChart, RadarChart,
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, MarkLineComponent,
])

defineProps({
  option: { type: Object, required: true },
  height: { type: String, default: '280px' },
})
</script>

<template>
  <ECharts :option="option" :style="{ height }" autoresize />
</template>
