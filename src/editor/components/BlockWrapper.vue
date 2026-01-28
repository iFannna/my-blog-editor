<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../store.js'
import { getBlockType } from '../../blocks/index.js'
import { getIcon } from '../../icons/index.js'

const props = defineProps({
  block: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

const store = useEditorStore()
const wrapperRef = ref(null)
const isHovered = ref(false)
const isDragOver = ref(false)
const dragOverPosition = ref(null)
const showMoreMenu = ref(false)

const isSelected = computed(function () {
  return store.selectedBlockId === props.block.clientId
})

const blockType = computed(function () {
  return getBlockType(props.block.name)
})

const canMoveUp = computed(function () {
  return props.index > 0
})

const canMoveDown = computed(function () {
  return props.index < store.blocksCount - 1
})

const isDragging = computed(function () {
  return store.draggingBlockId === props.block.clientId
})

watch(
  function () {
    return store.isDragging
  },
  function (dragging) {
    if (!dragging) {
      clearDragState()
    }
  },
)

watch(isSelected, function (selected) {
  if (!selected) {
    showMoreMenu.value = false
  }
})

function clearDragState() {
  isDragOver.value = false
  dragOverPosition.value = null
}

function handleSelect() {
  store.selectBlock(props.block.clientId)
}

function handleMoveUp() {
  store.moveBlock(props.block.clientId, 'up')
}

function handleMoveDown() {
  store.moveBlock(props.block.clientId, 'down')
}

function handleDelete() {
  store.removeBlock(props.block.clientId)
}

function updateAttributes(attrs) {
  store.updateBlockAttributes(props.block.clientId, attrs)
}

// ========== 更多选项菜单操作 ==========

function toggleMoreMenu() {
  showMoreMenu.value = !showMoreMenu.value
}

function closeMoreMenu() {
  showMoreMenu.value = false
}

// 复制块到系统剪贴板
function copyBlockToClipboard() {
  var html = store.serializeBlock(props.block)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(html)
      .then(function () {
        console.log('块已复制到剪贴板')
      })
      .catch(function (err) {
        console.warn('复制失败:', err)
        fallbackCopy(html)
      })
  } else {
    fallbackCopy(html)
  }
}

// 降级复制方案
function fallbackCopy(text) {
  var textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '-9999px'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  try {
    document.execCommand('copy')
    console.log('块已复制到剪贴板（降级方案）')
  } catch (err) {
    console.warn('降级复制失败:', err)
  }
  document.body.removeChild(textarea)
}

// 剪切块
function cutBlockToClipboard() {
  copyBlockToClipboard()
  // 延迟删除，确保复制完成
  setTimeout(function () {
    store.removeBlock(props.block.clientId)
  }, 50)
}

// 从系统剪贴板粘贴块
function pasteBlockFromClipboard() {
  if (navigator.clipboard && navigator.clipboard.readText) {
    navigator.clipboard
      .readText()
      .then(function (text) {
        handlePasteText(text)
      })
      .catch(function (err) {
        console.warn('读取剪贴板失败:', err)
      })
  }
}

// 处理粘贴的文本
function handlePasteText(text) {
  var blockData = store.parseBlockHtml(text)
  if (blockData) {
    var insertIndex = props.index + 1
    store.insertBlockAt(blockData.name, blockData.attributes, insertIndex)
  }
}

function handleCopy() {
  copyBlockToClipboard()
  closeMoreMenu()
}

function handleCut() {
  cutBlockToClipboard()
  closeMoreMenu()
}

function handlePaste() {
  pasteBlockFromClipboard()
  closeMoreMenu()
}

// ========== 判断是否正在编辑文本 ==========

function isEditingText() {
  var activeElement = document.activeElement
  if (!activeElement) return false

  // 检查是否在 contenteditable 元素中
  if (activeElement.isContentEditable) {
    return true
  }

  // 检查是否在输入框中
  if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
    return true
  }

  return false
}

// 检查是否有选中的文本
function hasSelectedText() {
  var selection = window.getSelection()
  return selection && selection.toString().length > 0
}

// ========== 快捷键处理 ==========

function handleKeyDown(e) {
  // 只处理选中状态的块
  if (!isSelected.value) {
    return
  }

  var isMod = e.metaKey || e.ctrlKey

  // Ctrl/Cmd + C 复制
  if (isMod && e.key.toLowerCase() === 'c') {
    // 如果有选中文本，让浏览器处理文本复制
    if (hasSelectedText()) {
      return
    }
    // 如果在编辑状态但没有选中文本，复制整个块
    e.preventDefault()
    e.stopPropagation()
    copyBlockToClipboard()
    return
  }

  // Ctrl/Cmd + X 剪切
  if (isMod && e.key.toLowerCase() === 'x') {
    // 如果有选中文本，让浏览器处理文本剪切
    if (hasSelectedText()) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    cutBlockToClipboard()
    return
  }

  // Ctrl/Cmd + V 粘贴
  if (isMod && e.key.toLowerCase() === 'v') {
    // 如果正在编辑文本，让浏览器处理文本粘贴
    if (isEditingText()) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    pasteBlockFromClipboard()
    return
  }

  // Delete 或 Backspace 删除块
  if (e.key === 'Delete' || e.key === 'Backspace') {
    // 如果正在编辑文本，不拦截
    if (isEditingText()) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    store.removeBlock(props.block.clientId)
    return
  }
}

// 点击外部关闭菜单
function handleClickOutside(e) {
  if (showMoreMenu.value && !e.target.closest('.more-menu-wrapper')) {
    closeMoreMenu()
  }
}

// ========== 拖拽手柄事件 ==========

function handleDragHandleMouseDown(e) {
  if (wrapperRef.value) {
    wrapperRef.value.setAttribute('draggable', 'true')
  }
}

function handleDragHandleMouseUp(e) {
  if (wrapperRef.value) {
    wrapperRef.value.removeAttribute('draggable')
  }
}

function handleDragStart(e) {
  if (!wrapperRef.value || wrapperRef.value.getAttribute('draggable') !== 'true') {
    e.preventDefault()
    return
  }

  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', props.block.clientId)
  e.dataTransfer.setData('application/x-block-id', props.block.clientId)
  e.dataTransfer.setData('application/x-block-index', String(props.index))

  setTimeout(function () {
    store.startDragging(props.block.clientId)
  }, 0)
}

function handleDragEnd(e) {
  clearDragState()
  store.stopDragging()

  if (wrapperRef.value) {
    wrapperRef.value.removeAttribute('draggable')
  }
}

function handleDragOver(e) {
  e.preventDefault()

  if (store.draggingBlockId === props.block.clientId) {
    return
  }

  e.dataTransfer.dropEffect = 'move'

  var rect = e.currentTarget.getBoundingClientRect()
  var midY = rect.top + rect.height / 2

  if (e.clientY < midY) {
    dragOverPosition.value = 'top'
  } else {
    dragOverPosition.value = 'bottom'
  }

  isDragOver.value = true
}

function handleDragEnter(e) {
  e.preventDefault()

  if (store.draggingBlockId === props.block.clientId) {
    return
  }

  isDragOver.value = true
}

function handleDragLeave(e) {
  var rect = e.currentTarget.getBoundingClientRect()
  var x = e.clientX
  var y = e.clientY

  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    clearDragState()
  }
}

function handleDrop(e) {
  e.preventDefault()

  var draggedId = e.dataTransfer.getData('application/x-block-id')

  if (!draggedId || draggedId === props.block.clientId) {
    clearDragState()
    return
  }

  var targetIndex = props.index
  if (dragOverPosition.value === 'bottom') {
    targetIndex = props.index + 1
  }

  store.moveBlockToIndex(draggedId, targetIndex)

  clearDragState()
  store.stopDragging()
}

function handleGlobalDragEnd() {
  clearDragState()
  if (wrapperRef.value) {
    wrapperRef.value.removeAttribute('draggable')
  }
}

function handleGlobalMouseUp() {
  if (wrapperRef.value) {
    wrapperRef.value.removeAttribute('draggable')
  }
}

onMounted(function () {
  document.addEventListener('dragend', handleGlobalDragEnd)
  document.addEventListener('mouseup', handleGlobalMouseUp)
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown, true)
})

onBeforeUnmount(function () {
  document.removeEventListener('dragend', handleGlobalDragEnd)
  document.removeEventListener('mouseup', handleGlobalMouseUp)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown, true)
})
</script>

<template>
  <div
    ref="wrapperRef"
    class="block-editor-block-wrapper"
    :class="{
      'is-selected': isSelected,
      'is-hovered': isHovered && !isSelected,
      'is-dragging': isDragging,
      'is-drag-over': isDragOver,
      'is-drag-over-top': isDragOver && dragOverPosition === 'top',
      'is-drag-over-bottom': isDragOver && dragOverPosition === 'bottom',
    }"
    @click.stop="handleSelect"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- 拖拽指示线 - 顶部 -->
    <div
      v-if="isDragOver && dragOverPosition === 'top'"
      class="drop-indicator drop-indicator-top"
    ></div>

    <!-- 块工具栏 -->
    <div v-if="isSelected" class="block-editor-block-toolbar">
      <!-- 拖���手柄 -->
      <button
        type="button"
        class="toolbar-button drag-handle"
        title="拖动以移动"
        @mousedown="handleDragHandleMouseDown"
        @mouseup="handleDragHandleMouseUp"
      >
        <span v-html="getIcon('dragHandle')"></span>
      </button>

      <div class="toolbar-divider"></div>

      <!-- 块图标 -->
      <button type="button" class="toolbar-button" :title="blockType?.title">
        <span v-html="getIcon(blockType?.iconName || 'paragraph')"></span>
      </button>

      <div class="toolbar-divider"></div>

      <!-- 上移 -->
      <button
        type="button"
        class="toolbar-button"
        title="上移"
        :disabled="!canMoveUp"
        @click.stop="handleMoveUp"
      >
        <span v-html="getIcon('chevronUp')"></span>
      </button>

      <!-- 下移 -->
      <button
        type="button"
        class="toolbar-button"
        title="下移"
        :disabled="!canMoveDown"
        @click.stop="handleMoveDown"
      >
        <span v-html="getIcon('chevronDown')"></span>
      </button>

      <div class="toolbar-divider"></div>

      <!-- 更多选项 -->
      <div class="more-menu-wrapper">
        <button type="button" class="toolbar-button" title="更多选项" @click.stop="toggleMoreMenu">
          <span v-html="getIcon('moreVertical')"></span>
        </button>

        <!-- 下拉菜单 -->
        <div v-if="showMoreMenu" class="more-menu-dropdown" @click.stop>
          <button type="button" class="menu-item" @click="handleCopy">
            <span class="menu-icon" v-html="getIcon('copy')"></span>
            <span class="menu-label">复制</span>
            <span class="menu-shortcut">Ctrl+C</span>
          </button>
          <button type="button" class="menu-item" @click="handleCut">
            <span class="menu-icon" v-html="getIcon('cut')"></span>
            <span class="menu-label">剪切</span>
            <span class="menu-shortcut">Ctrl+X</span>
          </button>
          <button type="button" class="menu-item" @click="handlePaste">
            <span class="menu-icon" v-html="getIcon('paste')"></span>
            <span class="menu-label">粘贴</span>
            <span class="menu-shortcut">Ctrl+V</span>
          </button>
          <div class="menu-divider"></div>
          <button type="button" class="menu-item is-danger" @click="handleDelete">
            <span class="menu-icon" v-html="getIcon('trash')"></span>
            <span class="menu-label">删除</span>
            <span class="menu-shortcut">Delete</span>
          </button>
        </div>
      </div>

      <!-- 删除 -->
      <button
        type="button"
        class="toolbar-button is-danger"
        title="删除"
        @click.stop="handleDelete"
      >
        <span v-html="getIcon('trash')"></span>
      </button>
    </div>

    <!-- 块内容 -->
    <div class="block-editor-block-content">
      <component
        v-if="blockType"
        :is="blockType.edit"
        :attributes="block.attributes"
        :client-id="block.clientId"
        :is-selected="isSelected"
        @update:attributes="updateAttributes"
      />
    </div>

    <!-- 拖拽指示线 - 底部 -->
    <div
      v-if="isDragOver && dragOverPosition === 'bottom'"
      class="drop-indicator drop-indicator-bottom"
    ></div>
  </div>
</template>

<style scoped>
.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

/* 更多选项菜单包装器 */
.more-menu-wrapper {
  position: relative;
}

/* 下拉菜单 */
.more-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 180px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: #1e1e1e;
  text-align: left;
  transition: background-color 0.15s ease;
}

.menu-item:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item.is-danger {
  color: #cc1818;
}

.menu-item.is-danger:hover:not(:disabled) {
  background-color: #fef0f0;
}

.menu-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.menu-label {
  flex: 1;
}

.menu-shortcut {
  font-size: 11px;
  color: #757575;
  margin-left: 16px;
}

.menu-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
}
</style>
