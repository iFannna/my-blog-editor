<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { getBlockType } from '../../blocks/index.js'

const props = defineProps({
  blockName: {
    type: String,
    required: true,
  },
  position: {
    type: Object,
    default: function () {
      return { x: 0, y: 0 }
    },
  },
})

const formulaPreviewRef = ref(null)

const blockType = computed(function () {
  return getBlockType(props.blockName)
})

// 渲染数学公式预览
function renderFormulaPreview() {
  if (props.blockName !== 'core/formula' || !formulaPreviewRef.value) {
    return
  }

  import('katex')
    .then(function (katexModule) {
      var katex = katexModule.default
      try {
        katex.render('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', formulaPreviewRef.value, {
          displayMode: true,
          throwOnError: false,
          output: 'html',
        })
      } catch (e) {
        formulaPreviewRef.value.textContent = 'x = (-b ± √(b²-4ac)) / 2a'
      }
    })
    .catch(function () {
      if (formulaPreviewRef.value) {
        formulaPreviewRef.value.textContent = 'x = (-b ± √(b²-4ac)) / 2a'
      }
    })
}

watch(
  function () {
    return props.blockName
  },
  function () {
    if (props.blockName === 'core/formula') {
      setTimeout(renderFormulaPreview, 0)
    }
  },
)

onMounted(function () {
  if (props.blockName === 'core/formula') {
    renderFormulaPreview()
  }
})

const previewContent = computed(function () {
  if (!blockType.value) {
    return ''
  }

  var name = props.blockName

  switch (name) {
    case 'core/paragraph':
      return '<p class="wp-block-paragraph">这是一个段落块的示例文本。您可以在这里输入任何内容，包括<strong>加粗</strong>、<em>斜体</em>和<a href="#">链接</a>等格式。</p>'

    case 'core/heading':
      return '<h2 class="wp-block-heading">这是一个标题</h2>'

    case 'core/image':
      return '<figure class="wp-block-image preview-figure"><div class="preview-image-placeholder"><svg viewBox="0 0 24 24" width="48" height="48"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.5h14c.3 0 .5.2.5.5v8.4l-3-2.9c-.3-.3-.8-.3-1 0L11 15l-3-3c-.3-.3-.8-.3-1 0l-2.5 2.5V5c0-.3.2-.5.5-.5z" fill="#757575"/></svg><span>图片</span></div></figure>'

    case 'core/code':
      return '<pre class="wp-block-code"><code>function hello() {\n  console.log("Hello!");\n}</code></pre>'

    case 'core/list':
      return '<ul class="wp-block-list"><li>列表项目一</li><li>列表项目二</li><li>列表项目三</li></ul>'

    case 'core/quote':
      return '<blockquote class="wp-block-quote"><p>这是一段引用文字，可以用来展示名人名言或者重要的引述内容。</p><cite>— 引用来源</cite></blockquote>'

    case 'core/details':
      return '<details class="wp-block-details" open><summary>点击展开详情</summary><p>这里是隐藏的详细内容，点击标题可以展开或收起。</p></details>'

    case 'core/formula':
      return ''

    case 'core/table':
      return '<table class="wp-block-table"><thead><tr><th>标题 1</th><th>标题 2</th></tr></thead><tbody><tr><td>数据 1</td><td>数据 2</td></tr><tr><td>数据 3</td><td>数据 4</td></tr></tbody></table>'

    case 'core/verse':
      return '<pre class="wp-block-verse">静夜思\n床前明月光，\n疑是地上霜。\n举头望明月，\n低头思故乡。</pre>'

    case 'core/gallery':
      return '<figure class="wp-block-gallery columns-3"><div class="gallery-grid"><div class="gallery-item"></div><div class="gallery-item"></div><div class="gallery-item"></div></div></figure>'

    case 'core/audio':
      return '<figure class="wp-block-audio"><div class="audio-preview"><span>▶</span><div class="audio-bar"></div></div><figcaption>音频说明</figcaption></figure>'

    case 'core/cover':
      return '<div class="wp-block-cover preview-cover"><span class="cover-overlay"></span><p class="cover-text">封面标题</p></div>'

    case 'core/file':
      return '<div class="wp-block-file"><a href="#">文档名称.pdf</a></div>'

    case 'core/media-text':
      return '<div class="wp-block-media-text"><div class="media-side"></div><div class="text-side"><p>在这里添加描述文字，与左侧媒体内容配合展示。</p></div></div>'

    case 'core/video':
      return '<figure class="wp-block-video"><div class="video-preview"><span>◪</span><span class="play-icon">▶</span></div><figcaption>视频说明</figcaption></figure>'

    case 'core/accordion':
      return '<div class="wp-block-accordion"><details open><summary>第一项</summary><p>折叠内容...</p></details><details><summary>第二项</summary><p>折叠内容...</p></details></div>'

    case 'core/button':
      return '<div class="wp-block-button"><a class="wp-block-button__link">按钮文字</a></div>'

    case 'core/columns':
      return '<div class="wp-block-columns"><div class="wp-block-column">列 1</div><div class="wp-block-column">列 2</div></div>'

    case 'core/grid':
      return '<div class="wp-block-grid"><div class="grid-cell"></div><div class="grid-cell"></div><div class="grid-cell"></div><div class="grid-cell"></div></div>'

    case 'core/separator':
      return '<hr class="wp-block-separator" />'

    default:
      return (
        '<div class="preview-placeholder"><p>' + (blockType.value?.title || '块') + '</p></div>'
      )
  }
})

const previewStyle = computed(function () {
  return {
    left: props.position.x + 'px',
    top: props.position.y + 'px',
  }
})

const isFormulaBlock = computed(function () {
  return props.blockName === 'core/formula'
})
</script>

<template>
  <div class="block-preview" :style="previewStyle">
    <div class="block-preview-header">
      <span class="block-preview-title">{{ blockType?.title }} 预览</span>
    </div>
    <div class="block-preview-content">
      <!-- 数学公式特殊预览 -->
      <div v-if="isFormulaBlock" class="formula-preview-wrapper">
        <div ref="formulaPreviewRef" class="formula-preview-content"></div>
      </div>
      <!-- 其他块的预览 -->
      <div v-else v-html="previewContent"></div>
    </div>
  </div>
</template>

<style scoped>
.block-preview {
  position: fixed;
  z-index: 1000;
  width: 320px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  pointer-events: none;
}

.block-preview-header {
  padding: 12px 16px;
  background: #f0f0f0;
  border-bottom: 1px solid #ddd;
}

.block-preview-title {
  font-size: 12px;
  font-weight: 500;
  color: #757575;
  text-transform: uppercase;
}

.block-preview-content {
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;
  max-height: 300px;
  overflow: hidden;
}

/* 数学公式预览样式 */
.formula-preview-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  padding: 16px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.formula-preview-content {
  text-align: center;
}

.formula-preview-content :deep(.katex) {
  font-size: 1.1em;
}

.formula-preview-content :deep(.katex-display) {
  margin: 0;
  overflow: hidden;
}

/* 预览内容样式 */
.block-preview-content :deep(p) {
  margin: 0;
}

.block-preview-content :deep(h2) {
  margin: 0;
  font-size: 1.5em;
  font-weight: 600;
}

.block-preview-content :deep(a) {
  color: #007cba;
}

.block-preview-content :deep(blockquote) {
  margin: 0;
  padding: 10px 20px;
  border-left: 4px solid #1e1e1e;
  font-style: italic;
}

.block-preview-content :deep(blockquote cite) {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #757575;
  font-style: normal;
}

.block-preview-content :deep(pre.wp-block-code) {
  margin: 0;
  padding: 16px;
  background: #1e1e1e;
  color: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.block-preview-content :deep(pre.wp-block-verse) {
  margin: 0;
  padding: 16px;
  background: #f9f9f9;
  border-left: 4px solid #ddd;
  font-family: Georgia, serif;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.block-preview-content :deep(ul),
.block-preview-content :deep(ol) {
  margin: 0;
  padding-left: 24px;
}

.block-preview-content :deep(li) {
  margin-bottom: 4px;
}

.block-preview-content :deep(hr) {
  border: none;
  border-top: 2px solid #1e1e1e;
  margin: 16px auto;
  width: 100px;
}

.block-preview-content :deep(details) {
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 4px;
}

.block-preview-content :deep(summary) {
  padding: 8px 12px;
  background: #f9f9f9;
  cursor: pointer;
  font-weight: 500;
}

.block-preview-content :deep(details p) {
  padding: 12px;
}

.block-preview-content :deep(.wp-block-table) {
  width: 100%;
  border-collapse: collapse;
}

.block-preview-content :deep(.wp-block-table th),
.block-preview-content :deep(.wp-block-table td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.block-preview-content :deep(.wp-block-table th) {
  background: #f0f0f0;
}

.block-preview-content :deep(.preview-figure) {
  margin: 0;
}

.block-preview-content :deep(.preview-image-placeholder) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  background: #f0f0f0;
  border-radius: 4px;
  color: #757575;
}

.block-preview-content :deep(figcaption) {
  margin-top: 8px;
  font-size: 12px;
  color: #757575;
  text-align: center;
}

.block-preview-content :deep(.gallery-grid) {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.block-preview-content :deep(.gallery-item) {
  height: 60px;
  background: #e0e0e0;
  border-radius: 4px;
}

.block-preview-content :deep(.audio-preview) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f0f0f0;
  border-radius: 4px;
}

.block-preview-content :deep(.audio-bar) {
  flex: 1;
  height: 4px;
  background: #ccc;
  border-radius: 2px;
}

.block-preview-content :deep(.preview-cover) {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  background: #1e1e1e;
  border-radius: 4px;
}

.block-preview-content :deep(.cover-overlay) {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.block-preview-content :deep(.cover-text) {
  position: relative;
  color: #fff;
  font-size: 1.2em;
  font-weight: 600;
}

.block-preview-content :deep(.wp-block-file) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.block-preview-content :deep(.file-icon) {
  font-size: 24px;
}

.block-preview-content :deep(.download-btn) {
  padding: 4px 12px;
  background: #1e1e1e;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
}

.block-preview-content :deep(.wp-block-media-text) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.block-preview-content :deep(.media-side) {
  height: 80px;
  background: #e0e0e0;
  border-radius: 4px;
}

.block-preview-content :deep(.text-side) {
  display: flex;
  align-items: center;
}

.block-preview-content :deep(.video-preview) {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  background: #1e1e1e;
  border-radius: 4px;
  font-size: 36px;
}

.block-preview-content :deep(.play-icon) {
  position: absolute;
  font-size: 24px;
  color: #fff;
}

.block-preview-content :deep(.wp-block-accordion) {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.block-preview-content :deep(.wp-block-button__link) {
  display: inline-block;
  padding: 10px 20px;
  background: #1e1e1e;
  color: #fff;
  border-radius: 4px;
  text-decoration: none;
}

.block-preview-content :deep(.wp-block-columns) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.block-preview-content :deep(.wp-block-column) {
  padding: 12px;
  background: #f0f0f0;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
  color: #757575;
}

.block-preview-content :deep(.wp-block-grid) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.block-preview-content :deep(.grid-cell) {
  height: 40px;
  background: #e0e0e0;
  border-radius: 4px;
}

.block-preview-content :deep(.preview-placeholder) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  background: #f0f0f0;
  border-radius: 4px;
  color: #757575;
}
</style>
