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

// 保存的选区
const savedStart = ref(null)
const savedEnd = ref(null)

const textColor = ref('')
const backgroundColor = ref('')

function updateState() {
  if (!props.editorRef || showHighlightPopover.value) {
    return
  }
  props.editorRef.syncFromDOM()
  isBold.value = props.editorRef.isFormatActive('bold')
  isItalic.value = props.editorRef.isFormatActive('italic')
  isStrike.value = props.editorRef.isFormatActive('strikethrough')
  isCode.value = props.editorRef.isFormatActive('code')
  isLink.value = props.editorRef.isFormatActive('link')
  isHighlight.value = props.editorRef.isFormatActive('highlight')
}

function handleFormat(type) {
  if (!props.editorRef) {
    return
  }

  if (type === 'link' && !isLink.value) {
    var url = prompt('请输入链接地址:')
    if (url) {
      props.editorRef.format('link', { href: url })
    }
  } else {
    props.editorRef.format(type)
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

function openHighlightPopover() {
  if (!props.editorRef) return

  // 获取并保存当前选区
  var sel = props.editorRef.getSelection()

  if (!sel || sel.start === undefined || sel.end === undefined || sel.start >= sel.end) {
    alert('请先选中需要高亮的文字')
    return
  }

  savedStart.value = sel.start
  savedEnd.value = sel.end

  showHighlightPopover.value = true
  showMoreMenu.value = false
}

function closeHighlightPopover() {
  showHighlightPopover.value = false
  savedStart.value = null
  savedEnd.value = null
  textColor.value = ''
  backgroundColor.value = ''
}

function handleUpdateTextColor(color) {
  textColor.value = color
  applyHighlightNow()
}

function handleUpdateBackgroundColor(color) {
  backgroundColor.value = color
  applyHighlightNow()
}

function applyHighlightNow() {
  if (!props.editorRef) return
  if (savedStart.value === null || savedEnd.value === null) return

  var attrs = { class: 'has-inline-color' }
  var styles = []

  if (backgroundColor.value) {
    styles.push('background-color:' + backgroundColor.value)
  } else {
    styles.push('background-color:rgba(0,0,0,0)')
  }

  if (textColor.value) {
    styles.push('color:' + textColor.value)
  }

  if (styles.length > 0) {
    attrs.style = styles.join(';')
  }

  props.editorRef.applyHighlight(savedStart.value, savedEnd.value, attrs)

  closeHighlightPopover()
}

function handleClearHighlight(type) {
  if (type === 'text') {
    textColor.value = ''
  } else {
    backgroundColor.value = ''
  }

  if (!textColor.value && !backgroundColor.value) {
    if (props.editorRef && savedStart.value !== null && savedEnd.value !== null) {
      props.editorRef.removeHighlightFormat(savedStart.value, savedEnd.value)
      closeHighlightPopover()
    }
  }
}

function insertInlineImage() {
  var url = prompt('请输入图片地址:')
  if (url && props.editorRef) {
    // 简单实现：插入 img 标签
    props.editorRef.syncFromDOM()
    var selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      var range = selection.getRangeAt(0)
      var img = document.createElement('img')
      img.src = url
      img.style.maxHeight = '1.5em'
      img.style.verticalAlign = 'middle'
      range.insertNode(img)
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
  <!-- 加粗 -->
  <button
    type="button"
    class="format-button"
    :class="{ 'is-active': isBold }"
    title="加粗 (Ctrl+B)"
    @click="handleFormat('bold')"
  >
    <span v-html="getIcon('bold')"></span>
  </button>

  <!-- 斜体 -->
  <button
    type="button"
    class="format-button"
    :class="{ 'is-active': isItalic }"
    title="斜体 (Ctrl+I)"
    @click="handleFormat('italic')"
  >
    <span v-html="getIcon('italic')"></span>
  </button>

  <!-- 删除线 -->
  <button
    type="button"
    class="format-button"
    :class="{ 'is-active': isStrike }"
    title="删除线"
    @click="handleFormat('strikethrough')"
  >
    <span v-html="getIcon('strikethrough')"></span>
  </button>

  <!-- 链接 -->
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

  <!-- 更多按钮 -->
  <div class="more-menu-wrapper">
    <button
      type="button"
      class="format-button"
      :class="{ 'is-active': showMoreMenu || showHighlightPopover }"
      title="更多格式"
      @click.stop="toggleMoreMenu"
    >
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" fill="currentColor" />
      </svg>
    </button>

    <!-- 更多下拉菜单 -->
    <div v-if="showMoreMenu" class="more-dropdown" @click.stop>
      <button
        type="button"
        class="dropdown-item"
        :class="{ 'is-active': isHighlight }"
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

    <!-- 高亮弹窗 -->
    <HighlightPopover
      :visible="showHighlightPopover"
      :text-color="textColor"
      :background-color="backgroundColor"
      @close="closeHighlightPopover"
      @update:text-color="handleUpdateTextColor"
      @update:background-color="handleUpdateBackgroundColor"
      @clear="handleClearHighlight"
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
