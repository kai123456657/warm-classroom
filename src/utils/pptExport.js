import pptxgen from 'pptxgenjs'

/**
 * 将大纲导出为真正的 .pptx 文件（基于 pptxgenjs）
 * 全部在浏览器端完成，无需后端
 */
export async function exportPpt(
  topic,
  outline,
  theme,
  teacherName = '王明远',
) {
  const pptx = new pptxgen()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = teacherName
  pptx.title = topic
  pptx.subject = '暖课堂 · 智能生成课件'
  pptx.company = 'Warm Classroom'

  const [primary, accent, light] = theme.colors
  const hex = (c) => c.replace('#', '').toUpperCase()

  // —— 封面页 ——
  const cover = pptx.addSlide()
  cover.background = { color: hex(light) }
  cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: '100%', fill: { color: hex(primary) } })
  cover.addShape(pptx.ShapeType.ellipse, {
    x: 8.2, y: -1.2, w: 4.5, h: 4.5,
    fill: { color: hex(accent), transparency: 72 },
  })
  cover.addText('WARM CLASSROOM · 智能课件', {
    x: 0.9, y: 1.5, w: 8, h: 0.4,
    fontSize: 13, bold: true, charSpacing: 3, color: hex(primary), fontFace: 'Arial',
  })
  cover.addText(topic, {
    x: 0.9, y: 2.2, w: 10.5, h: 2,
    fontSize: 44, bold: true, color: '2B2422', fontFace: 'Arial', breakLine: false,
  })
  cover.addShape(pptx.ShapeType.rect, { x: 0.95, y: 4.35, w: 1.6, h: 0.06, fill: { color: hex(primary) } })
  cover.addText(`主讲教师：${teacherName}    |    暖课堂智慧教学平台`, {
    x: 0.9, y: 4.7, w: 9, h: 0.4, fontSize: 15, color: '6D5E57', fontFace: 'Arial',
  })

  // —— 内容页 ——
  outline.forEach((section, idx) => {
    const slide = pptx.addSlide()
    slide.background = { color: 'FFFFFF' }
    // 顶部色带
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.12, fill: { color: hex(primary) } })
    // 左侧序号块
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.7, y: 0.75, w: 0.75, h: 0.75,
      fill: { color: hex(primary) }, rectRadius: 0.12,
    })
    slide.addText(String(idx + 1).padStart(2, '0'), {
      x: 0.7, y: 0.75, w: 0.75, h: 0.75,
      fontSize: 22, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', fontFace: 'Arial',
    })
    // 标题
    slide.addText(section.title, {
      x: 1.7, y: 0.72, w: 10.5, h: 0.85,
      fontSize: 28, bold: true, color: '2B2422', valign: 'middle', fontFace: 'Arial',
    })
    // 分隔线
    slide.addShape(pptx.ShapeType.rect, { x: 1.72, y: 1.72, w: 1.4, h: 0.05, fill: { color: hex(accent) } })
    // 内容要点
    const points = section.points.map((p, i) => ({
      text: p,
      options: { bullet: { code: '25AA' }, breakLine: true, paraSpaceAfter: 14, color: '4A4040', fontSize: 18, indentLevel: 0, ...(i === 0 ? {} : {}) },
    }))
    slide.addText(points, { x: 1.7, y: 2.15, w: 10.8, h: 4.3, fontFace: 'Arial', valign: 'top' })
    // 页脚
    slide.addText(topic, { x: 0.7, y: 7.05, w: 6, h: 0.3, fontSize: 10, color: 'A2938A', fontFace: 'Arial' })
    slide.addText(`${idx + 1} / ${outline.length}`, { x: 11.5, y: 7.05, w: 1.1, h: 0.3, fontSize: 10, color: 'A2938A', align: 'right', fontFace: 'Arial' })
  })

  // —— 结束页 ——
  const end = pptx.addSlide()
  end.background = { color: hex(primary) }
  end.addText('谢谢观看', {
    x: 0, y: 2.5, w: '100%', h: 1.2,
    fontSize: 52, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial',
  })
  end.addText('暖课堂 · 让每一堂课都有温度', {
    x: 0, y: 3.9, w: '100%', h: 0.5,
    fontSize: 18, color: 'FFFFFF', align: 'center', fontFace: 'Arial',
  })

  await pptx.writeFile({ fileName: `${topic.replace(/[\\/:*?"<>|]/g, '_')}_课件.pptx` })
}
