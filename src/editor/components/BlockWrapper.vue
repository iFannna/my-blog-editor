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

watch(isSelected, function (selected) {
  if (!selected) {
    showMoreMenu.value = false
  }
})

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

// ========== 更多选项菜单 ==========

function toggleMoreMenu() {
  showMoreMenu.value = !showMoreMenu.value
}

function closeMoreMenu() {
  showMoreMenu.value = false
}

function copyBlockToClipboard() {
  var html = store.serializeBlock(props.block)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(html).catch(function (err) {
      console.warn('复制失败:', err)
    })
  }
}

function cutBlockToClipboard() {
  copyBlockToClipboard()
  setTimeout(function () {
    store.removeBlock(props.block.clientId)
  }, 50)
}

function pasteBlockFromClipboard() {
  if (navigator.clipboard && navigator.clipboard.readText) {
    navigator.clipboard.readText().then(function (text) {
      var blockData = store.parseBlockHtml(text)
      if (blockData) {
        store.insertBlockAt(blockData.name, blockData.attributes, props.index + 1)
      }
    })
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

// ========== 判断是否正在编辑 ==========

function isEditingText() {
  var activeElement = document.activeElement
  if (!activeElement) return false
  if (activeElement.isContentEditable) return true
  if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') return true
  return false
}

function hasSelectedText() {
  var selection = window.getSelection()
  return selection && selection.toString().length > 0
}

// ========== 快捷键 ==========

function handleKeyDown(e) {
  if (!isSelected.value) return

  var isMod = e.metaKey || e.ctrlKey

  if (isMod && e.key.toLowerCase() === 'c') {
    if (hasSelectedText()) return
    e.preventDefault()
    copyBlockToClipboard()
    return
  }

  if (isMod && e.key.toLowerCase() === 'x') {
    if (hasSelectedText()) return
    e.preventDefault()
    cutBlockToClipboard()
    return
  }

  if (isMod && e.key.toLowerCase() === 'v') {
    if (isEditingText()) return
    e.preventDefault()
    pasteBlockFromClipboard()
    return
  }

  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (isEditingText()) return
    e.preventDefault()
    store.removeBlock(props.block.clientId)
  }
}

function handleClickOutside(e) {
  if (showMoreMenu.value && !e.target.closest('.more-menu-wrapper')) {
    closeMoreMenu()
  }
}

// ========== 拖拽 ==========

function handleDragStart(e) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', props.block.clientId)
  e.dataTransfer.setData('application/x-block-id', props.block.clientId)

  store.startDragging(props.block.clientId)
}

function handleDragEnd(e) {
  store.stopDragging()
}

onMounted(function () {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown, true)
})

onBeforeUnmount(function () {
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
    }"
    draggable="false"
    @click.stop="handleSelect"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- 块工具栏 -->
    <div v-if="isSelected" class="block-editor-block-toolbar">
      <!-- 拖拽手柄 -->
      <div
        class="toolbar-button drag-handle"
        draggable="true"
        title="拖动以移动"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
      >
        <span v-html="getIcon('dragHandle')"></span>
      </div>

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
  </div>
</template>

<style scoped>
.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.block-editor-block-wrapper.is-dragging {
  opacity: 0.5;
}

/* 更多选项菜单 */
.more-menu-wrapper {
  position: relative;
}

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
}

.menu-item:hover {
  background-color: #f0f0f0;
}

.menu-item.is-danger {
  color: #cc1818;
}

.menu-item.is-danger:hover {
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
