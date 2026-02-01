<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import FormatToolbar from '../../editor/components/FormatToolbar.vue'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()
const listRef = ref(null)
const isComposing = ref(false)

// 模拟 editorRef 接口供 FormatToolbar 使用
const editorInterface = ref({
  $el: null,
  format: function (type, attrs) {
    document.execCommand(getExecCommand(type), false, attrs?.href || null)
    handleInput()
  },
  isFormatActive: function (type) {
    return document.queryCommandState(getExecCommand(type))
  },
  syncFromDOM: function () {},
})

function getExecCommand(type) {
  const map = {
    bold: 'bold',
    italic: 'italic',
    strikethrough: 'strikeThrough',
    link: 'createLink',
  }
  return map[type] || type
}

const ordered = computed({
  get: function () {
    return props.attributes.ordered || false
  },
  set: function (val) {
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
  // Tab 缩进
  if (e.key === 'Tab') {
    e.preventDefault()
    if (e.shiftKey) {
      document.execCommand('outdent')
    } else {
      document.execCommand('indent')
    }
    handleInput()
  }

  // 快捷键支持
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'b') {
      e.preventDefault()
      document.execCommand('bold')
      handleInput()
    } else if (e.key === 'i') {
      e.preventDefault()
      document.execCommand('italic')
      handleInput()
    } else if (e.key === 'k') {
      e.preventDefault()
      var url = prompt('请输入链接地址:')
      if (url) {
        document.execCommand('createLink', false, url)
        handleInput()
      }
    }
  }
}

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
  if (listRef.value) {
    editorInterface.value.$el = listRef.value
  }
})

watch(
  function () {
    return props.attributes.ordered
  },
  function () {
    nextTick(ensureContent)
  },
)

watch(
  function () {
    return props.attributes.values
  },
  function (newVal) {
    if (listRef.value && listRef.value.innerHTML !== newVal) {
      listRef.value.innerHTML = newVal || '<li></li>'
    }
  },
)
</script>

<template>
  <div class="list-block-wrapper" :class="{ 'is-selected': isSelected }">
    <!-- 工具栏 -->
    <div v-if="isSelected" class="block-editor-format-toolbar list-toolbar">
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': !ordered }"
        title="无序列表"
        @click="ordered = false"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <circle cx="5" cy="8" r="1.5" fill="currentColor" />
          <circle cx="5" cy="12" r="1.5" fill="currentColor" />
          <circle cx="5" cy="16" r="1.5" fill="currentColor" />
          <rect x="9" y="7" width="11" height="2" fill="currentColor" />
          <rect x="9" y="11" width="11" height="2" fill="currentColor" />
          <rect x="9" y="15" width="11" height="2" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': ordered }"
        title="有序列表"
        @click="ordered = true"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <text x="3" y="9" font-size="6" fill="currentColor">1.</text>
          <text x="3" y="13" font-size="6" fill="currentColor">2.</text>
          <text x="3" y="17" font-size="6" fill="currentColor">3.</text>
          <rect x="11" y="7" width="9" height="2" fill="currentColor" />
          <rect x="11" y="11" width="9" height="2" fill="currentColor" />
          <rect x="11" y="15" width="9" height="2" fill="currentColor" />
        </svg>
      </button>
      <div class="format-divider"></div>
      <!-- 富文本格式工具栏 -->
      <FormatToolbar :editor-ref="editorInterface" />
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
  margin-bottom: 8px;
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

/* 富文本格式 */
.wp-block-list :deep(strong),
.wp-block-list :deep(b) {
  font-weight: bold;
}

.wp-block-list :deep(em),
.wp-block-list :deep(i) {
  font-style: italic;
}

.wp-block-list :deep(s),
.wp-block-list :deep(del) {
  text-decoration: line-through;
}

.wp-block-list :deep(code) {
  font-family: monospace;
  background: #f0f0f0;
  padding: 0.1em 0.3em;
  border-radius: 2px;
}

.wp-block-list :deep(a) {
  color: #3858e9;
  text-decoration: underline;
}

.wp-block-list :deep(mark) {
  padding: 0.1em 0;
}

/* 空列表占位 */
.wp-block-list:empty::after {
  content: '输入列表项...';
  color: #949494;
  font-style: italic;
}
</style>
