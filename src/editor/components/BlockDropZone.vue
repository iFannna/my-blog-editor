<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../store.js'

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
})

const store = useEditorStore()
const isActive = ref(false)

const isVisible = computed(function () {
  return store.isDragging
})

// 监听全局拖拽状态，当拖拽结束时清除本地状态
watch(
  function () {
    return store.isDragging
  },
  function (dragging) {
    if (!dragging) {
      isActive.value = false
    }
  },
)

function handleDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  isActive.value = true
}

function handleDragEnter(e) {
  e.preventDefault()
  isActive.value = true
}

function handleDragLeave(e) {
  // 检查是否真的离开了元素
  var rect = e.currentTarget.getBoundingClientRect()
  var x = e.clientX
  var y = e.clientY

  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isActive.value = false
  }
}

function handleDrop(e) {
  e.preventDefault()

  // 检查是否是从侧边栏拖入的新块类型
  var blockType = e.dataTransfer.getData('application/x-block-type')
  if (blockType) {
    store.insertBlock(blockType, {}, props.index)
    isActive.value = false
    store.stopDragging()
    return
  }

  // 检查是否是移动现有块
  var draggedId = e.dataTransfer.getData('application/x-block-id')
  if (draggedId) {
    store.moveBlockToIndex(draggedId, props.index)
    isActive.value = false
    store.stopDragging()
    return
  }

  isActive.value = false
}

// 全局 dragend 监听
function handleGlobalDragEnd() {
  isActive.value = false
}

onMounted(function () {
  document.addEventListener('dragend', handleGlobalDragEnd)
})

onBeforeUnmount(function () {
  document.removeEventListener('dragend', handleGlobalDragEnd)
})
</script>

<template>
  <div
    v-if="isVisible"
    class="block-drop-zone"
    :class="{ 'is-active': isActive }"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div v-if="isActive" class="drop-zone-indicator">
      <span>放置区块</span>
    </div>
  </div>
</template>

<style scoped>
.block-drop-zone {
  position: relative;
  min-height: 8px;
  margin: 4px 0;
  transition: all 0.15s ease;
}

.block-drop-zone.is-active {
  min-height: 60px;
  background: rgba(0, 124, 186, 0.08);
  border: 2px dashed var(--color-primary);
  border-radius: var(--radius-medium);
}

.drop-zone-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-medium);
  font-size: 12px;
  white-space: nowrap;
}
</style>
