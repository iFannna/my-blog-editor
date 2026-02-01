<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import RichTextEditor from '../../editor/components/RichTextEditor.vue'
import FormatToolbar from '../../editor/components/FormatToolbar.vue'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()
const isOpen = ref(true)
const summaryRef = ref(null)
const contentRef = ref(null)

// 使用 shallowRef 或直接存储组件引用
const currentEditorRef = ref(null)

const summary = computed({
  get: function () {
    return props.attributes.summary || '详细信息'
  },
  set: function (val) {
    emit('update:attributes', { summary: val })
  },
})

const content = computed({
  get: function () {
    return props.attributes.content || ''
  },
  set: function (val) {
    emit('update:attributes', { content: val })
  },
})

function handleChangeComplete() {
  store.commitBlockChanges()
}

function toggleOpen(e) {
  // 只有点击箭头时才切换展开状态
  e.stopPropagation()
  isOpen.value = !isOpen.value
}

function handleSummaryFocus() {
  // 直接设置为 summaryRef，不是 summaryRef.value
  currentEditorRef.value = summaryRef.value
}

function handleContentFocus() {
  currentEditorRef.value = contentRef.value
}

// 处理 summary 区域的键盘事件
function handleSummaryKeyDown(e) {
  // 只有按 Ctrl/Cmd + Enter 才切换展开
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    isOpen.value = !isOpen.value
  }
}

// 监听选中状态变化
watch(
  function () {
    return props.isSelected
  },
  function (selected) {
    if (!selected) {
      currentEditorRef.value = null
    } else {
      // 默认聚焦到 summary
      nextTick(function () {
        if (summaryRef.value) {
          currentEditorRef.value = summaryRef.value
        }
      })
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="details-block-wrapper" :class="{ 'is-selected': isSelected }">
    <!-- 工具栏 -->
    <div v-if="isSelected" class="block-editor-format-toolbar details-toolbar">
      <!-- 富文本格式工具栏 - 直接传递当前编辑器引用 -->
      <FormatToolbar :editor-ref="currentEditorRef" />
    </div>

    <div class="wp-block-details" :class="{ 'is-open': isOpen }">
      <div class="details-summary">
        <button type="button" class="details-marker" @click="toggleOpen">
          {{ isOpen ? '▼' : '▶' }}
        </button>
        <div class="summary-editor-wrapper">
          <RichTextEditor
            ref="summaryRef"
            v-model="summary"
            tag="span"
            class="summary-text"
            placeholder="摘要"
            @focus="handleSummaryFocus"
            @keydown="handleSummaryKeyDown"
            @change-complete="handleChangeComplete"
          />
        </div>
      </div>
      <div v-if="isOpen" class="details-content">
        <RichTextEditor
          ref="contentRef"
          v-model="content"
          tag="p"
          placeholder="详细内容…"
          @focus="handleContentFocus"
          @change-complete="handleChangeComplete"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.details-block-wrapper {
  position: relative;
}

.details-toolbar {
  margin-bottom: 8px;
}

.wp-block-details {
  border: 0px !important;
}

.details-summary {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
  gap: 8px;
}

.details-marker {
  font-size: 10px;
  color: #404040;
  cursor: pointer;
  user-select: none;
  padding: 4px 6px;
  line-height: 1;
  flex-shrink: 0;
  background: none;
  border: none;
  border-radius: 2px;
}

.details-marker:hover {
  color: #1e1e1e;
  background: #f0f0f0;
}

.summary-editor-wrapper {
  flex: 1;
  min-width: 0;
}

.summary-text {
  display: inline;
  font-weight: 500;
}

.details-content {
  padding: 8px 0 8px 22px;
}

.details-content :deep(p) {
  margin: 0;
}

/* 富文本格式 */
.wp-block-details :deep(strong),
.wp-block-details :deep(b) {
  font-weight: bold;
}

.wp-block-details :deep(em),
.wp-block-details :deep(i) {
  font-style: italic;
}

.wp-block-details :deep(s),
.wp-block-details :deep(del) {
  text-decoration: line-through;
}

.wp-block-details :deep(code) {
  font-family: monospace;
  background: #f0f0f0;
  padding: 0.1em 0.3em;
  border-radius: 2px;
}

.wp-block-details :deep(a) {
  color: #3858e9;
  text-decoration: underline;
}

.wp-block-details :deep(mark) {
  padding: 0.1em 0;
}
</style>
