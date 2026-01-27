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

// ========== 拖拽手柄事件 ==========

function handleDragHandleMouseDown(e) {
  // 设置整个包装器可拖动
  if (wrapperRef.value) {
    wrapperRef.value.setAttribute('draggable', 'true')
  }
}

function handleDragHandleMouseUp(e) {
  // 移除拖动属性
  if (wrapperRef.value) {
    wrapperRef.value.removeAttribute('draggable')
  }
}

function handleDragStart(e) {
  // 只有从拖动手柄开始才允许拖动
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

  // 移除拖动属性
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
  // 鼠标释放时移除拖动属性
  if (wrapperRef.value) {
    wrapperRef.value.removeAttribute('draggable')
  }
}

onMounted(function () {
  document.addEventListener('dragend', handleGlobalDragEnd)
  document.addEventListener('mouseup', handleGlobalMouseUp)
})

onBeforeUnmount(function () {
  document.removeEventListener('dragend', handleGlobalDragEnd)
  document.removeEventListener('mouseup', handleGlobalMouseUp)
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
      <!-- 拖拽手柄 - 只有这个可以拖动 -->
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
      <button type="button" class="toolbar-button" title="更多选项">
        <span v-html="getIcon('moreVertical')"></span>
      </button>

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
</style>
