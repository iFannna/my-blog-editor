<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()

const isEditing = ref(false)
const previewRef = ref(null)
const inputRef = ref(null)
const errorMessage = ref('')

const content = computed({
  get: function () {
    return props.attributes.content || ''
  },
  set: function (val) {
    emit('update:attributes', { content: val })
  },
})

const displayMode = computed({
  get: function () {
    return props.attributes.displayMode !== false
  },
  set: function (val) {
    emit('update:attributes', { displayMode: val })
    store.commitBlockChanges()
  },
})

// 渲染公式
function renderFormula() {
  if (!previewRef.value) return

  if (!content.value) {
    previewRef.value.innerHTML = '<span class="formula-placeholder">输入 LaTeX 公式</span>'
    errorMessage.value = ''
    return
  }

  try {
    katex.render(content.value, previewRef.value, {
      displayMode: displayMode.value,
      throwOnError: true,
      output: 'html',
    })
    errorMessage.value = ''
  } catch (e) {
    previewRef.value.innerHTML = '<span class="formula-error">' + content.value + '</span>'
    errorMessage.value = e.message
  }
}

// 监听内容变化
watch([content, displayMode], function () {
  if (!isEditing.value) {
    nextTick(renderFormula)
  }
})

// 监听选中状态变化
watch(
  function () {
    return props.isSelected
  },
  function (selected) {
    if (!selected) {
      isEditing.value = false
      nextTick(renderFormula)
    }
  },
)

// 开始编辑
function startEdit() {
  if (!props.isSelected) return
  isEditing.value = true
  nextTick(function () {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
}

// 结束编辑
function finishEdit() {
  isEditing.value = false
  store.commitBlockChanges()
  nextTick(renderFormula)
}

// 处理输入
function handleInput(e) {
  content.value = e.target.value
}

// 快捷键
function handleKeyDown(e) {
  if (e.key === 'Escape') {
    finishEdit()
  }
  if (e.key === 'Enter' && e.ctrlKey) {
    finishEdit()
  }
}

onMounted(function () {
  renderFormula()
})

// 示例公式
var examples = [
  { label: '分数', value: '\\frac{a}{b}' },
  { label: '根号', value: '\\sqrt{x}' },
  { label: '求和', value: '\\sum_{i=1}^{n} i' },
  { label: '积分', value: '\\int_{0}^{\\infty} e^{-x} dx' },
  { label: '矩阵', value: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: '二次公式', value: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
]

function insertExample(example) {
  content.value = example.value
  store.commitBlockChanges()
  nextTick(renderFormula)
}
</script>

<template>
  <div
    class="wp-block-formula"
    :class="{
      'is-display': displayMode,
      'is-editing': isEditing,
      'is-selected': isSelected,
    }"
  >
    <!-- 工具栏-->
    <div v-if="isSelected" class="block-editor-format-toolbar formula-toolbar">
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': displayMode }"
        title="块级公式（独占一行）"
        @click="displayMode = true"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M4 5h16v1.5H4V5zm0 5.5h16V12H4v-1.5zm0 5.5h16v1.5H4V16z" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': !displayMode }"
        title="行内公式"
        @click="displayMode = false"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M4 11h16v2H4z" fill="currentColor" />
        </svg>
      </button>
      <div class="format-divider"></div>
      <span class="toolbar-label">示例</span>
      <button
        v-for="ex in examples"
        :key="ex.label"
        type="button"
        class="format-button"
        @click="insertExample(ex)"
      >
        {{ ex.label }}
      </button>
    </div>

    <!-- 编辑模式 -->
    <div v-if="isEditing" class="formula-editor">
      <textarea
        ref="inputRef"
        class="formula-input"
        :value="content"
        placeholder="输入 LaTeX 公式，例如: x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
        @input="handleInput"
        @blur="finishEdit"
        @keydown="handleKeyDown"
      ></textarea>
      <div class="formula-hint">
        <span>按 Ctrl+Enter 或点击外部完成编辑</span>
      </div>
    </div>

    <!-- 预览模式 -->
    <div v-if="!isEditing" class="formula-display" @click="startEdit">
      <div v-if="content" ref="previewRef" class="formula-preview"></div>
      <div v-else class="formula-placeholder-block">
        <span class="placeholder-icon">∑</span>
        <span class="placeholder-text">点击输入数学公式</span>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="formula-error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
/* 工具栏标签样式 */
.formula-toolbar .toolbar-label {
  font-size: 13px;
  color: var(--color-gray-600, #757575);
  margin-right: 4px;
}

.formula-input {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.formula-hint {
  margin-top: 4px;
  font-size: 11px;
  color: #757575;
}

/* 预览区域 */
.formula-display {
  cursor: text;
}

.formula-preview {
  min-height: 40px;
}

.formula-preview :deep(.katex) {
  font-size: 1.2em;
}

.formula-preview :deep(.katex-display) {
  margin: 0;
}

/* 占位符区域 */
.formula-placeholder-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  color: #757575;
  cursor: pointer;
}

.formula-placeholder-block:hover {
  background: #f0f0f0;
}

.placeholder-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.placeholder-text {
  font-size: 13px;
}

/* 错误提示 */
.formula-error-message {
  margin-top: 8px;
  padding: 8px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c00;
  font-size: 12px;
}

:deep(.formula-placeholder) {
  color: #999;
  font-style: italic;
}

:deep(.formula-error) {
  color: #c00;
  font-family: monospace;
}
</style>
