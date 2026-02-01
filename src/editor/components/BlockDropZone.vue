<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../store.js'

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
})

const store = useEditorStore()
const isHovering = ref(false)

// 当拖拽结束时重置状态
watch(
  function () {
    return store.draggingBlockId
  },
  function (val) {
    if (!val) {
      isHovering.value = false
    }
  },
)

function handleDragOver(e) {
  e.preventDefault()
  e.stopPropagation()
  isHovering.value = true
  store.setDragOverIndex(props.index)
}

function handleDragLeave(e) {
  e.preventDefault()
  isHovering.value = false
  if (store.dragOverIndex === props.index) {
    store.setDragOverIndex(null)
  }
}

function handleDrop(e) {
  e.preventDefault()
  e.stopPropagation()

  isHovering.value = false
  store.setDragOverIndex(null)

  // 从侧边栏拖入新区块
  var blockType = e.dataTransfer.getData('application/x-block-type')
  if (blockType) {
    store.insertBlock(blockType, {}, props.index)
    store.stopDragging()
    return
  }

  // 移动已有区块
  var draggedId = e.dataTransfer.getData('application/x-block-id')
  if (draggedId) {
    store.moveBlockToIndex(draggedId, props.index)
    store.stopDragging()
  }
}

function resetState() {
  isHovering.value = false
}

onMounted(function () {
  document.addEventListener('dragend', resetState)
  document.addEventListener('drop', resetState)
})

onBeforeUnmount(function () {
  document.removeEventListener('dragend', resetState)
  document.removeEventListener('drop', resetState)
})
</script>

<template>
  <div
    class="block-drop-zone"
    :class="{ 'is-hovering': isHovering }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  ></div>
</template>

<style scoped>
.block-drop-zone {
  height: 8px;
  margin: 0;
  position: relative;
}

.block-drop-zone.is-hovering::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 4px;
  background: #3858e9;
  border-radius: 2px;
  transform: translateY(-50%);
}

.block-drop-zone.is-hovering::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #3858e9;
  border-radius: 50%;
  transform: translateY(-50%) translateX(-4px);
  box-shadow: calc(100vw - 100% + 100% - 4px) 0 0 0 #3858e9;
}
</style>
