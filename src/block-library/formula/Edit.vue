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
    <!-- 工具栏 -->
    <div v-if="isSelected" class="formula-toolbar">
      <label class="toolbar-checkbox">
        <input type="checkbox" v-model="displayMode" />
        块级显示
      </label>
      <div class="toolbar-divider"></div>
      <span class="toolbar-label">示例:</span>
      <button
        v-for="ex in examples"
        :key="ex.label"
        type="button"
        class="example-btn"
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
        <span class="placeholder-icon">√x̄</span>
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
.wp-block-formula {
  position: relative;
  padding: 16px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.wp-block-formula.is-selected {
  border-color: #007cba;
}

.wp-block-formula.is-display .formula-preview {
  text-align: center;
}

.formula-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

.toolbar-checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  cursor: pointer;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #ddd;
}

.toolbar-label {
  font-size: 12px;
  color: #757575;
}

.example-btn {
  padding: 2px 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  background: #fff;
  font-size: 11px;
  cursor: pointer;
}

.example-btn:hover {
  background: #f0f0f0;
  border-color: #007cba;
}

.formula-editor {
  margin-bottom: 12px;
}

.formula-input {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #007cba;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.formula-input:focus {
  box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.2);
}

.formula-hint {
  margin-top: 4px;
  font-size: 11px;
  color: #757575;
}

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
