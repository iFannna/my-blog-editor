<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../../editor/store.js'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()

const MIN_HEIGHT = 1
const MAX_HEIGHT = 5000

const isResizing = ref(false)
const isHovered = ref(false)
const startY = ref(0)
const startHeight = ref(0)
const spacerRef = ref(null)
const spacerWidth = ref(800)

// 解析高度值
function parseHeight(value) {
  if (!value) return 100
  var num = parseInt(value, 10)
  return isNaN(num) ? 100 : num
}

const height = computed({
  get: function () {
    return props.attributes.height || '100px'
  },
  set: function (val) {
    emit('update:attributes', { height: val })
  },
})

const heightValue = computed(function () {
  return parseHeight(height.value)
})

const spacerStyle = computed(function () {
  return {
    height: height.value,
  }
})

// 更新宽度
function updateWidth() {
  if (spacerRef.value) {
    spacerWidth.value = spacerRef.value.offsetWidth
  }
}

// 开始拖拽
function onResizeStart(e) {
  e.preventDefault()
  e.stopPropagation()
  isResizing.value = true
  startY.value = e.clientY
  startHeight.value = heightValue.value

  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
}

function onResizeMove(e) {
  if (!isResizing.value) return

  var deltaY = e.clientY - startY.value
  var newHeight = startHeight.value + deltaY

  if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT
  if (newHeight > MAX_HEIGHT) newHeight = MAX_HEIGHT

  height.value = newHeight + 'px'
  updateWidth()
}

function onResizeEnd() {
  if (isResizing.value) {
    isResizing.value = false
    store.commitBlockChanges()
  }

  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
}

function onMouseEnter() {
  isHovered.value = true
}

function onMouseLeave() {
  if (!isResizing.value) {
    isHovered.value = false
  }
}

onMounted(function () {
  updateWidth()
  window.addEventListener('resize', updateWidth)
})

onBeforeUnmount(function () {
  window.removeEventListener('resize', updateWidth)
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
})
</script>

<template>
  <div
    ref="spacerRef"
    class="wp-block-spacer"
    :class="{
      'is-selected': isSelected,
      'is-hovered': isHovered && !isSelected,
      'is-resizing': isResizing,
    }"
    :style="spacerStyle"
    aria-hidden="true"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- 尺寸指示器（拖拽时显示在右上角） -->
    <div v-if="isResizing" class="size-indicator">{{ spacerWidth }} x {{ heightValue }}</div>

    <!-- 圆形拖拽手柄（选中时显示） -->
    <div v-if="isSelected" class="resize-handle" @mousedown="onResizeStart">
      <span class="handle-circle"></span>
    </div>
  </div>
</template>

<style scoped>
.wp-block-spacer {
  position: relative;
  clear: both;
  background: transparent;
}

/* 未选中时 Hover - 显示灰色背景 */
.wp-block-spacer.is-hovered {
  background: rgba(0, 0, 0, 0.1);
}

/* 选中状态 - 蓝色边框 + 灰色背景 */
.wp-block-spacer.is-selected {
  background: rgba(0, 0, 0, 0.1);
  outline: 1.5px solid #3858e9;
  outline-offset: -1.5px;
}

/* 拖拽状态 */
.wp-block-spacer.is-resizing {
  background: rgba(0, 0, 0, 0.1);
}

/* 圆形拖拽手柄 */
.resize-handle {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  cursor: ns-resize;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.handle-circle {
  width: 14px;
  height: 14px;
  border: 1.5px solid #3858e9;
  border-radius: 50%;
  background: #fff;
}

.resize-handle:hover .handle-circle {
  background: #3858e9;
  border-color: #3858e9;
}

/* 尺寸指示器 */
.size-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background: #1e1e1e;
  color: #fff;
  font-size: 12px;
  border-radius: 2px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 10;
}
</style>
