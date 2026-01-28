<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getIcon } from '../../icons/index.js'
import HighlightPopover from './HighlightPopover.vue'

const props = defineProps({
  editorRef: {
    type: Object,
    default: null,
  },
})

const isBold = ref(false)
const isItalic = ref(false)
const isStrike = ref(false)
const isCode = ref(false)
const isLink = ref(false)
const isHighlight = ref(false)

const showMoreMenu = ref(false)
const showHighlightPopover = ref(false)

const savedRange = ref(null)

const initialTextColor = ref('')
const initialBgColor = ref('')

const textColor = ref('')
const backgroundColor = ref('')

function getEditorElement() {
  if (!props.editorRef) return null
  var editor = props.editorRef.value || props.editorRef
  if (editor && editor.$el) return editor.$el
  if (editor && editor.nodeType === 1) return editor
  return null
}

function getEditor() {
  if (!props.editorRef) return null
  return props.editorRef.value || props.editorRef
}

function updateState() {
  if (showHighlightPopover.value) return

  var editor = getEditor()
  if (!editor) return

  if (typeof editor.syncFromDOM === 'function') {
    editor.syncFromDOM()
  }
  if (typeof editor.isFormatActive === 'function') {
    isBold.value = editor.isFormatActive('bold')
    isItalic.value = editor.isFormatActive('italic')
    isStrike.value = editor.isFormatActive('strikethrough')
    isCode.value = editor.isFormatActive('code')
    isLink.value = editor.isFormatActive('link')
    isHighlight.value = editor.isFormatActive('highlight')
  }
}

function handleFormat(type) {
  var editor = getEditor()
  if (!editor) return

  if (type === 'link' && !isLink.value) {
    var url = prompt('请输入链接地址:')
    if (url && typeof editor.format === 'function') {
      editor.format('link', { href: url })
    }
  } else if (typeof editor.format === 'function') {
    editor.format(type)
  }

  closeMoreMenu()
}

function toggleMoreMenu() {
  showMoreMenu.value = !showMoreMenu.value
  if (showMoreMenu.value) {
    showHighlightPopover.value = false
  }
}

function closeMoreMenu() {
  showMoreMenu.value = false
}

function saveCurrentSelection() {
  var selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    var range = selection.getRangeAt(0)
    var editorEl = getEditorElement()
    if (editorEl && editorEl.contains(range.commonAncestorContainer)) {
      if (!range.collapsed) {
        savedRange.value = range.cloneRange()
        return true
      }
    }
  }
  return false
}

function normalizeColor(color) {
  if (!color) return ''
  color = color.trim()
  if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') return ''
  return color
}

function getExistingColorsFromSelection() {
  var result = { textColor: '', backgroundColor: '' }

  if (!savedRange.value) return result

  var container = savedRange.value.commonAncestorContainer
  var mark = null

  if (container.nodeType === 3) {
    mark = container.parentElement
    while (mark && mark.tagName !== 'MARK') {
      mark = mark.parentElement
    }
  } else if (container.nodeType === 1) {
    if (container.tagName === 'MARK') {
      mark = container
    } else {
      mark = container.querySelector('mark') || container.closest('mark')
    }
  }

  if (mark) {
    var style = mark.style
    result.textColor = normalizeColor(style.color)
    result.backgroundColor = normalizeColor(style.backgroundColor)
  }

  return result
}

function openHighlightPopover() {
  // 尝试保存选区，如果没有选中文字则静默返回（不弹窗提示）
  if (!saveCurrentSelection()) {
    return
  }

  var existing = getExistingColorsFromSelection()
  initialTextColor.value = existing.textColor
  initialBgColor.value = existing.backgroundColor
  textColor.value = existing.textColor
  backgroundColor.value = existing.backgroundColor

  showHighlightPopover.value = true
  showMoreMenu.value = false
}

function closeHighlightPopover() {
  showHighlightPopover.value = false
  savedRange.value = null
  textColor.value = ''
  backgroundColor.value = ''
  initialTextColor.value = ''
  initialBgColor.value = ''
}

function handleUpdateTextColor(color) {
  textColor.value = color
}

function handleUpdateBackgroundColor(color) {
  backgroundColor.value = color
}

function handleApplyHighlight() {
  if (!savedRange.value) return

  if (!textColor.value && !backgroundColor.value) {
    handleClearHighlight()
    return
  }

  applyHighlightToSelection()
  closeHighlightPopover()
}

function applyHighlightToSelection() {
  if (!savedRange.value) return

  var editorEl = getEditorElement()
  if (!editorEl) return

  var finalTextColor = textColor.value
  var finalBgColor = backgroundColor.value

  var styleStr = ''
  if (finalBgColor) {
    styleStr += 'background-color:' + finalBgColor + ';'
  } else {
    styleStr += 'background-color:rgba(0,0,0,0);'
  }
  if (finalTextColor) {
    styleStr += 'color:' + finalTextColor + ';'
  }

  var selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(savedRange.value)

  var range = selection.getRangeAt(0)
  var selectedContent = range.cloneContents()

  var tempDiv = document.createElement('div')
  tempDiv.appendChild(selectedContent)

  unwrapAllMarks(tempDiv)

  range.deleteContents()

  var mark = document.createElement('mark')
  mark.style.cssText = styleStr
  mark.className = 'has-inline-color'

  while (tempDiv.firstChild) {
    mark.appendChild(tempDiv.firstChild)
  }

  range.insertNode(mark)

  editorEl.normalize()
  selection.removeAllRanges()
  editorEl.dispatchEvent(new Event('input', { bubbles: true }))
}

function unwrapAllMarks(container) {
  var marks = container.querySelectorAll('mark')
  for (var i = marks.length - 1; i >= 0; i--) {
    var mark = marks[i]
    var parent = mark.parentNode
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark)
    }
    parent.removeChild(mark)
  }
}

function handleClearHighlight() {
  if (!savedRange.value) {
    closeHighlightPopover()
    return
  }

  var editorEl = getEditorElement()
  if (!editorEl) {
    closeHighlightPopover()
    return
  }

  var selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(savedRange.value)

  var range = selection.getRangeAt(0)

  var selectedContent = range.cloneContents()
  var tempDiv = document.createElement('div')
  tempDiv.appendChild(selectedContent)

  unwrapAllMarks(tempDiv)

  range.deleteContents()

  var fragment = document.createDocumentFragment()
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild)
  }
  range.insertNode(fragment)

  editorEl.normalize()
  selection.removeAllRanges()
  editorEl.dispatchEvent(new Event('input', { bubbles: true }))

  closeHighlightPopover()
}

function handleClearColorType(type) {
  if (type === 'text') {
    textColor.value = ''
  } else {
    backgroundColor.value = ''
  }
}

function insertInlineImage() {
  var url = prompt('请输入图片地址:')
  if (url) {
    var selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      var range = selection.getRangeAt(0)
      var img = document.createElement('img')
      img.src = url
      img.style.maxHeight = '1.5em'
      img.style.verticalAlign = 'middle'
      range.insertNode(img)

      var editorEl = getEditorElement()
      if (editorEl) {
        editorEl.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
  }
  closeMoreMenu()
}

function handleGlobalClick(e) {
  if (!e.target.closest('.more-menu-wrapper')) {
    closeMoreMenu()
  }
  if (!e.target.closest('.highlight-popover') && !e.target.closest('.more-dropdown')) {
    if (showHighlightPopover.value) {
      closeHighlightPopover()
    }
  }
}

onMounted(function () {
  document.addEventListener('selectionchange', updateState)
  document.addEventListener('click', handleGlobalClick)
})

onBeforeUnmount(function () {
  document.removeEventListener('selectionchange', updateState)
  document.removeEventListener('click', handleGlobalClick)
})
</script>

<template>
  <button
    type="button"
    class="format-button"
    :class="{ 'is-active': isBold }"
    title="加粗 (Ctrl+B)"
    @click="handleFormat('bold')"
  >
    <span v-html="getIcon('bold')"></span>
  </button>

  <button
    type="button"
    class="format-button"
    :class="{ 'is-active': isItalic }"
    title="斜体 (Ctrl+I)"
    @click="handleFormat('italic')"
  >
    <span v-html="getIcon('italic')"></span>
  </button>

  <button
    type="button"
    class="format-button"
    :class="{ 'is-active': isStrike }"
    title="删除线"
    @click="handleFormat('strikethrough')"
  >
    <span v-html="getIcon('strikethrough')"></span>
  </button>

  <button
    type="button"
    class="format-button"
    :class="{ 'is-active': isLink }"
    title="链接 (Ctrl+K)"
    @click="handleFormat('link')"
  >
    <span v-html="getIcon('link')"></span>
  </button>

  <div class="format-divider"></div>

  <div class="more-menu-wrapper">
    <button
      type="button"
      class="format-button"
      :class="{ 'is-active': showMoreMenu || showHighlightPopover }"
      title="更多格式"
      @mousedown.prevent
      @click.stop="toggleMoreMenu"
    >
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" fill="currentColor" />
      </svg>
    </button>

    <div v-if="showMoreMenu" class="more-dropdown" @mousedown.prevent @click.stop>
      <button
        type="button"
        class="dropdown-item"
        :class="{ 'is-active': isHighlight }"
        @mousedown.prevent
        @click="openHighlightPopover"
      >
        <span class="dropdown-icon">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14.5c-3.6 0-6.5-2.9-6.5-6.5S8.4 5.5 12 5.5s6.5 2.9 6.5 6.5-2.9 6.5-6.5 6.5z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span class="dropdown-label">高亮</span>
      </button>

      <button
        type="button"
        class="dropdown-item"
        :class="{ 'is-active': isCode }"
        @click="handleFormat('code')"
      >
        <span class="dropdown-icon">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span class="dropdown-label">行内代码</span>
      </button>

      <button type="button" class="dropdown-item" @click="insertInlineImage">
        <span class="dropdown-icon">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M4 18.5h16V17H4v1.5zM4 7v7.5h16V7H4zm10 5.5H6v-4h8v4z" fill="currentColor" />
          </svg>
        </span>
        <span class="dropdown-label">行内图片</span>
      </button>
    </div>

    <HighlightPopover
      :visible="showHighlightPopover"
      :text-color="textColor"
      :background-color="backgroundColor"
      @close="closeHighlightPopover"
      @update:text-color="handleUpdateTextColor"
      @update:background-color="handleUpdateBackgroundColor"
      @apply="handleApplyHighlight"
      @clear="handleClearHighlight"
      @clear-type="handleClearColorType"
    />
  </div>
</template>

<style scoped>
.more-menu-wrapper {
  position: relative;
}

.more-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  min-width: 160px;
  background: #fff;
  border: 1px solid #1e1e1e;
  border-radius: 2px;
  padding: 0;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  font-size: 13px;
  color: #1e1e1e;
  cursor: pointer;
  text-align: left;
  gap: 12px;
}

.dropdown-item:first-child {
  border-radius: 1px 1px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 1px 1px;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.dropdown-item.is-active {
  background-color: #e9f0ff;
  outline: 1.5px solid #3858e9;
  outline-offset: -1.5px;
  border-radius: 2px;
}

.dropdown-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.dropdown-icon svg {
  width: 24px;
  height: 24px;
}

.dropdown-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.dropdown-label {
  flex: 1;
  font-size: 13px;
}
</style>
