<template>
  <!-- 无图片时：占位符 -->
  <div
    v-if="!url"
    class="wp-block-image"
    :class="{ 'has-illustration': !isSelected }"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <!-- 未选中时：简约占位符（带对角线插图） -->
    <template v-if="!isSelected">
      <svg
        class="placeholder-illustration"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 60 60"
        preserveAspectRatio="none"
      >
        <path vector-effect="non-scaling-stroke" d="M60 60 0 0" />
      </svg>
    </template>

    <!-- 选中时：完整交互占位符 -->
    <template v-else>
      <div class="header">
        <span class="icon" v-html="imageIcon"></span>
        <span>图片</span>
      </div>
      <div class="tips">拖放图片、上传或从你的库中选择。</div>
      <div class="button-row">
        <button class="button" @click.stop="onUpload">上传</button>
        <button class="button" @click.stop="onMediaLibrary">媒体库</button>
        <button ref="urlButtonRef" class="button" @click.stop="onInsertUrl">URL插入</button>
      </div>
    </template>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />

    <URLPopover
      v-model:visible="showURLPopover"
      :anchor-el="urlButtonRef"
      placeholder="粘贴或输入图片 URL"
      @submit="handleURLSubmit"
      @close="handleURLClose"
    />
  </div>

  <!-- 有图片时：显示图片 -->
  <figure
    v-else
    ref="figureRef"
    class="wp-block-image has-image"
    :class="{ 'is-selected': isSelected, 'is-resizing': isResizing }"
  >
    <div class="image-wrapper" :style="imageWrapperStyle">
      <img :src="url" :alt="alt" :style="imageStyle" @load="onImageLoad" />

      <!-- 尺寸指示器（拖拽时显示） -->
      <div v-if="isResizing" class="size-indicator">{{ currentWidth }} x {{ currentHeight }}</div>

      <!-- 底部拖拽手柄（选中时显示） -->
      <div v-if="isSelected" class="resize-handle" @mousedown="onResizeStart">
        <span class="handle-circle"></span>
      </div>
    </div>

    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import { getIcon } from '@/icons/index.js'
import URLPopover from '../../editor/components/URLPopover.vue'

const props = defineProps({
  attributes: {
    type: Object,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()

const imageIcon = getIcon('image')
const fileInput = ref(null)
const urlButtonRef = ref(null)
const showURLPopover = ref(false)
const figureRef = ref(null)

// 缩放相关
const isResizing = ref(false)
const startY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)
const naturalWidth = ref(0)
const naturalHeight = ref(0)
const currentWidth = ref(0)
const currentHeight = ref(0)

// 属性
const url = computed({
  get() {
    return props.attributes.url || ''
  },
  set(val) {
    emit('update:attributes', { url: val })
  },
})

const alt = computed({
  get() {
    return props.attributes.alt || ''
  },
  set(val) {
    emit('update:attributes', { alt: val })
  },
})

const caption = computed({
  get() {
    return props.attributes.caption || ''
  },
  set(val) {
    emit('update:attributes', { caption: val })
  },
})

const width = computed({
  get() {
    return props.attributes.width || ''
  },
  set(val) {
    emit('update:attributes', { width: val })
  },
})

const height = computed({
  get() {
    return props.attributes.height || ''
  },
  set(val) {
    emit('update:attributes', { height: val })
  },
})

// 图片包裹层样式
const imageWrapperStyle = computed(function () {
  var style = {
    position: 'relative',
    display: 'inline-block',
    maxWidth: '100%',
  }
  if (width.value) {
    style.width = width.value
  }
  return style
})

// 图片样式
const imageStyle = computed(function () {
  var style = {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
  }
  if (width.value) {
    style.width = '100%'
  }
  if (height.value) {
    style.height = height.value
  }
  return style
})

// 图片加载完成
function onImageLoad(e) {
  naturalWidth.value = e.target.naturalWidth
  naturalHeight.value = e.target.naturalHeight
  currentWidth.value = e.target.offsetWidth
  currentHeight.value = e.target.offsetHeight
}

// 开始缩放
function onResizeStart(e) {
  e.preventDefault()
  e.stopPropagation()

  isResizing.value = true
  startY.value = e.clientY

  var img = figureRef.value.querySelector('img')
  startWidth.value = img.offsetWidth
  startHeight.value = img.offsetHeight
  currentWidth.value = startWidth.value
  currentHeight.value = startHeight.value

  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
}

function onResizeMove(e) {
  if (!isResizing.value) return

  var deltaY = e.clientY - startY.value
  var aspectRatio = naturalWidth.value / naturalHeight.value

  var newHeight = Math.max(50, startHeight.value + deltaY)
  var newWidth = Math.round(newHeight * aspectRatio)

  currentWidth.value = newWidth
  currentHeight.value = newHeight
  width.value = newWidth + 'px'
  height.value = newHeight + 'px'
}

function onResizeEnd() {
  if (isResizing.value) {
    isResizing.value = false
    store.commitBlockChanges()
  }

  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
}

// 上传按钮
function onUpload() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  var file = e.target.files && e.target.files[0]
  if (file) {
    var reader = new FileReader()
    reader.onload = function () {
      url.value = reader.result
      width.value = ''
      height.value = ''
      store.commitBlockChanges()
    }
    reader.readAsDataURL(file)
  }
  e.target.value = ''
}

// 媒体库按钮
function onMediaLibrary() {
  alert('媒体库功能待实现')
}

// URL插入按钮
function onInsertUrl() {
  showURLPopover.value = true
}

function handleURLSubmit(inputUrl) {
  if (inputUrl) {
    url.value = inputUrl
    width.value = ''
    height.value = ''
    store.commitBlockChanges()
  }
}

function handleURLClose() {
  showURLPopover.value = false
}

// 拖拽上传
function handleDrop(e) {
  var files = e.dataTransfer.files
  if (files && files.length > 0) {
    var file = files[0]
    if (file.type.startsWith('image/')) {
      var reader = new FileReader()
      reader.onload = function () {
        url.value = reader.result
        width.value = ''
        height.value = ''
        store.commitBlockChanges()
      }
      reader.readAsDataURL(file)
    }
  }
}

watch(
  function () {
    return props.isSelected
  },
  function (selected) {
    if (!selected) {
      showURLPopover.value = false
    }
  },
)

onBeforeUnmount(function () {
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
})
</script>

<style scoped>
/* ============================================
     块样式 - 图片
     ============================================ */
.wp-block-image {
  border: 1px solid #1e1e1e;
  border-radius: 2px;
  padding: 24px;
  box-sizing: border-box;
  min-height: 150px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  transition:
    box-shadow 0.2s,
    border-color 0.2s,
    background 0.2s;
}

.wp-block-image .header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #434343;
  margin-bottom: 8px;
}

.wp-block-image .header .icon {
  width: 24px;
  height: 24px;
  display: inline-block;
  background: url("data:image/svg+xml,%3Csvg width='20' height='20' fill='none' stroke='%23434343' stroke-width='1.8' viewBox='0 0 20 20'%3E%3Crect x='2.5' y='4.5' width='15' height='11' rx='2.5'/%3E%3Cpath d='M2.5 13L7.2 8.4c.4-.4 1-.4 1.4 0l3.5 3.5'/%3E%3Ccircle cx='8.5' cy='8.5' r='1' fill='%23434343'/%3E%3C/svg%3E")
    no-repeat center/contain;
  margin-right: 2px;
}

.wp-block-image .tips {
  color: #888;
  margin-bottom: 20px;
  font-size: 14px;
}

.wp-block-image .button-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.wp-block-image .button-row .button {
  font-size: 15px;
  padding: 7px 18px;
  border: 1.5px solid #366ef4;
  background: white;
  color: #366ef4;
  border-radius: 3px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  min-width: 72px;
}

.wp-block-image .button-row .button:first-child {
  background: #366ef4;
  color: white;
}

.wp-block-image .button-row .button:hover {
  background: #e9f2ff;
}

.wp-block-image:hover {
  background: #fff;
}
/* 未选中时的简约占位符样式 */
.wp-block-image.has-illustration {
  background-color: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  overflow: hidden;
}

/* 灰色背景遮罩 */
.wp-block-image.has-illustration::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  background: currentColor;
  opacity: 0.1;
  border-radius: 3px;
}

/* 对角线 SVG 插图 */
.placeholder-illustration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  stroke: currentColor;
  opacity: 0.25;
}

/* 有图片时 - 居中显示，无边框 */
.wp-block-image.has-image {
  margin: 0;
  border: none !important;
  text-align: center;
}

.wp-block-image.has-image img {
  max-width: 100%;
  height: auto;
  display: block;
}

.wp-block-image.has-image figcaption {
  margin-top: 8px;
  font-size: 13px;
  color: #757575;
  text-align: center;
}

/* 图片包裹层 - 居中 */
.image-wrapper {
  position: relative;
  display: inline-block;
  max-width: 100%;
  margin: 0 auto;
}

/* 选中状态 - 蓝色边框 */
.wp-block-image.is-selected .image-wrapper,
.wp-block-image.is-resizing .image-wrapper {
  outline: 1.5px solid #3858e9;
  outline-offset: 2px;
}

/* 底部拖拽手柄 */
.resize-handle {
  position: absolute;
  bottom: -12px;
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
  transition: background 0.15s;
}

.resize-handle:hover .handle-circle {
  background: #3858e9;
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
