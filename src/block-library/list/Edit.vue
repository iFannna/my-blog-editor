<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useEditorStore } from '../../editor/store.js'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()
const listRef = ref(null)
const isComposing = ref(false)

const ordered = computed({
  get: function () {
    return props.attributes.ordered || false
  },
  set: function (val) {
    // 保存当前内容
    var currentContent = listRef.value ? listRef.value.innerHTML : values.value
    emit('update:attributes', { ordered: val, values: currentContent })
    store.commitBlockChanges()
  },
})

const values = computed({
  get: function () {
    return props.attributes.values || ''
  },
  set: function (val) {
    emit('update:attributes', { values: val })
  },
})

function handleInput() {
  if (listRef.value) {
    values.value = listRef.value.innerHTML
    if (!isComposing.value) {
      store.commitBlockChanges()
    }
  }
}

function handleCompositionStart() {
  isComposing.value = true
}

function handleCompositionEnd() {
  isComposing.value = false
  handleInput()
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    // 让浏览器默认创建新 li
  }
  if (e.key === 'Tab') {
    e.preventDefault()
    if (e.shiftKey) {
      document.execCommand('outdent')
    } else {
      document.execCommand('indent')
    }
  }
}

// 确保有初始内容
function ensureContent() {
  if (listRef.value) {
    var content = values.value
    if (
      !content ||
      content.trim() === '' ||
      content === '<li></li>' ||
      content === '<li><br></li>'
    ) {
      listRef.value.innerHTML = '<li></li>'
      // 将光标放入第一个 li
      var li = listRef.value.querySelector('li')
      if (li) {
        var range = document.createRange()
        var sel = window.getSelection()
        range.setStart(li, 0)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    } else {
      listRef.value.innerHTML = content
    }
  }
}

onMounted(function () {
  ensureContent()
})

// 监听 ordered 变化，重新设置内容
watch(
  function () {
    return props.attributes.ordered
  },
  function () {
    nextTick(ensureContent)
  },
)
</script>

<template>
  <div class="list-block-wrapper" :class="{ 'is-selected': isSelected }">
    <!-- 工具栏 -->
    <div v-if="isSelected" class="list-toolbar">
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': !ordered }"
        title="无序列表"
        @click="ordered = false"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <circle cx="6" cy="8" r="1.5" fill="currentColor" />
          <circle cx="6" cy="12" r="1.5" fill="currentColor" />
          <circle cx="6" cy="16" r="1.5" fill="currentColor" />
          <rect x="10" y="7" width="10" height="2" fill="currentColor" />
          <rect x="10" y="11" width="10" height="2" fill="currentColor" />
          <rect x="10" y="15" width="10" height="2" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': ordered }"
        title="有序列表"
        @click="ordered = true"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <text x="4" y="10" font-size="8" fill="currentColor">1.</text>
          <text x="4" y="14" font-size="8" fill="currentColor">2.</text>
          <text x="4" y="18" font-size="8" fill="currentColor">3.</text>
          <rect x="12" y="7" width="8" height="2" fill="currentColor" />
          <rect x="12" y="11" width="8" height="2" fill="currentColor" />
          <rect x="12" y="15" width="8" height="2" fill="currentColor" />
        </svg>
      </button>
    </div>

    <!-- 列表内容 -->
    <div class="list-content">
      <ol
        v-if="ordered"
        ref="listRef"
        class="wp-block-list wp-block-list--ordered"
        contenteditable="true"
        @input="handleInput"
        @keydown="handleKeyDown"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
      ></ol>
      <ul
        v-else
        ref="listRef"
        class="wp-block-list wp-block-list--unordered"
        contenteditable="true"
        @input="handleInput"
        @keydown="handleKeyDown"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
      ></ul>
    </div>
  </div>
</template>

<style scoped>
.list-block-wrapper {
  position: relative;
}

.list-toolbar {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  padding: 8px;
  background: #f0f0f0;
  border-radius: 4px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: #fff;
  color: #1e1e1e;
  cursor: pointer;
}

.toolbar-btn:hover {
  background: #e0e0e0;
}

.toolbar-btn.is-active {
  background: #1e1e1e;
  color: #fff;
}

.list-content {
  position: relative;
}

/* 列表基础样式 */
.wp-block-list {
  margin: 0;
  padding: 0 0 0 24px;
  outline: none;
  min-height: 24px;
}

/* 无序列表 */
.wp-block-list--unordered {
  list-style-type: disc !important;
}

/* 有序列表 */
.wp-block-list--ordered {
  list-style-type: decimal !important;
}

/* 列表项样式 */
.wp-block-list :deep(li) {
  display: list-item !important;
  margin: 0 0 4px 0;
  padding: 0;
  min-height: 1.5em;
}

/* 嵌套列表 */
.wp-block-list :deep(ul) {
  list-style-type: circle !important;
  padding-left: 24px;
  margin: 4px 0;
}

.wp-block-list :deep(ol) {
  list-style-type: lower-alpha !important;
  padding-left: 24px;
  margin: 4px 0;
}

.wp-block-list :deep(ul ul),
.wp-block-list :deep(ol ol) {
  list-style-type: square !important;
}

/* 空列表占位 */
.wp-block-list:empty::after {
  content: '输入列表项...';
  color: #949494;
  font-style: italic;
}
</style>
