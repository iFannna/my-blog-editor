<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import { getIcon } from '@/icons/index.js'
import RichTextEditor from '../../editor/components/RichTextEditor.vue'
import FormatToolbar from '../../editor/components/FormatToolbar.vue'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()

const coverIcon = getIcon('cover')
const fileInput = ref(null)
const editorRef = ref(null)
const coverRef = ref(null)

// 缩放相关
const isResizing = ref(false)
const startY = ref(0)
const startHeight = ref(0)
const currentHeight = ref(300)

const MIN_HEIGHT = 100
const MAX_HEIGHT = 800

// 预设颜色列表
const presetColors = [
  '#3858e9',
  '#4785ed',
  '#1e1e1e',
  '#e0e0e0',
  '#cfcfcf',
  '#000000',
  '#87a6bc',
  '#ffffff',
  '#ffc0cb',
  '#e53935',
  '#ff5722',
  '#ffb300',
  '#c5e1a5',
  '#4caf50',
  '#90caf9',
  '#2196f3',
  '#7e57c2',
]

const url = computed({
  get: function () {
    return props.attributes.url || ''
  },
  set: function (val) {
    emit('update:attributes', { url: val })
  },
})

const backgroundColor = computed({
  get: function () {
    return props.attributes.backgroundColor || ''
  },
  set: function (val) {
    emit('update:attributes', { backgroundColor: val })
  },
})

const title = computed({
  get: function () {
    return props.attributes.title || ''
  },
  set: function (val) {
    emit('update:attributes', { title: val })
  },
})

const minHeight = computed({
  get: function () {
    return props.attributes.minHeight || 300
  },
  set: function (val) {
    emit('update:attributes', { minHeight: val })
  },
})

const textAlign = computed({
  get: function () {
    return props.attributes.textAlign || 'center'
  },
  set: function (val) {
    emit('update:attributes', { textAlign: val })
    store.commitBlockChanges()
  },
})

// 是否有背景（图片或颜色）
const hasBackground = computed(function () {
  return url.value || backgroundColor.value
})

// 封面样式 - 直接使用背景，无蒙版
const coverStyle = computed(function () {
  var style = { minHeight: minHeight.value + 'px' }
  if (url.value) {
    style.backgroundImage = 'url(' + url.value + ')'
    style.backgroundColor = '#1e1e1e'
  } else if (backgroundColor.value) {
    style.backgroundColor = backgroundColor.value
  }
  return style
})

// 判断是否使用深色文字（浅色背景时）
const useDarkText = computed(function () {
  if (url.value) return false
  if (!backgroundColor.value) return false

  var lightColors = ['#e0e0e0', '#cfcfcf', '#ffffff', '#ffc0cb', '#c5e1a5', '#90caf9', '#ffb300']
  return lightColors.indexOf(backgroundColor.value) !== -1
})

function onUpload() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  var file = e.target.files && e.target.files[0]
  if (file) {
    var reader = new FileReader()
    reader.onload = function () {
      url.value = reader.result
      backgroundColor.value = ''
      store.commitBlockChanges()
    }
    reader.readAsDataURL(file)
  }
  e.target.value = ''
}

function onMediaLibrary() {
  alert('媒体库功能待实现')
}

function onUseFeaturedImage() {
  alert('使用特色图片功能待实现')
}

function handleDrop(e) {
  var files = e.dataTransfer.files
  if (files && files.length > 0) {
    var file = files[0]
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      var reader = new FileReader()
      reader.onload = function () {
        url.value = reader.result
        backgroundColor.value = ''
        store.commitBlockChanges()
      }
      reader.readAsDataURL(file)
    }
  }
}

function selectColor(color) {
  backgroundColor.value = color
  url.value = ''
  store.commitBlockChanges()
}

function handleChangeComplete() {
  store.commitBlockChanges()
}

// 更换背景（保留文本，回到选择背景状态）
function replaceBackground() {
  url.value = ''
  backgroundColor.value = ''
  store.commitBlockChanges()
}

// 开始拖拽调整高度
function onResizeStart(e) {
  e.preventDefault()
  e.stopPropagation()
  isResizing.value = true
  startY.value = e.clientY
  startHeight.value = minHeight.value
  currentHeight.value = minHeight.value

  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
}

function onResizeMove(e) {
  if (!isResizing.value) return

  var deltaY = e.clientY - startY.value
  var newHeight = startHeight.value + deltaY

  if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT
  if (newHeight > MAX_HEIGHT) newHeight = MAX_HEIGHT

  currentHeight.value = newHeight
  emit('update:attributes', { minHeight: newHeight })
}

function onResizeEnd() {
  if (isResizing.value) {
    isResizing.value = false
    store.commitBlockChanges()
  }

  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
}

// 获取封面宽度用于显示尺寸
const coverWidth = computed(function () {
  if (coverRef.value) {
    return coverRef.value.offsetWidth
  }
  return 0
})

watch(
  function () {
    return props.isSelected
  },
  function (selected) {
    if (!selected) {
      isResizing.value = false
    }
  },
)

onBeforeUnmount(function () {
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
})
</script>

<template>
  <div class="wp-block-cover-wrapper">
    <!-- 工具栏（有背景时显示） -->
    <div v-if="isSelected && hasBackground" class="block-editor-format-toolbar cover-toolbar">
      <!-- 更换背景按钮 -->
      <button type="button" class="format-button" title="更换背景" @click="replaceBackground">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path
            d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"
            fill="currentColor"
          />
        </svg>
      </button>

      <div class="format-divider"></div>

      <!-- 文本对齐按钮 -->
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': textAlign === 'left' }"
        title="左对齐"
        @click="textAlign = 'left'"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M4 5h16v1.5H4V5zm0 5.5h10V12H4v-1.5zm0 5.5h16v1.5H4V16z" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': textAlign === 'center' || !textAlign }"
        title="居中对齐"
        @click="textAlign = 'center'"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M4 5h16v1.5H4V5zm3 5.5h10V12H7v-1.5zM4 16h16v1.5H4V16z" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': textAlign === 'right' }"
        title="���对齐"
        @click="textAlign = 'right'"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M4 5h16v1.5H4V5zm6 5.5h10V12H10v-1.5zM4 16h16v1.5H4V16z" fill="currentColor" />
        </svg>
      </button>

      <div class="format-divider"></div>

      <!-- 富文本工具栏 -->
      <FormatToolbar :editor-ref="editorRef" />
    </div>

    <!-- 无背景时：占位符 -->
    <div
      v-if="!hasBackground"
      class="wp-block-cover-placeholder"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <div class="placeholder-content">
        <div class="header">
          <span class="icon" v-html="coverIcon"></span>
          <span>封面</span>
        </div>
        <div class="tips">拖放图片或视频，上传，或从你的库中选择。</div>
        <div class="button-row">
          <button class="button primary" @click.stop="onUpload">上传</button>
          <button class="button" @click.stop="onMediaLibrary">媒体库</button>
          <button class="button" @click.stop="onUseFeaturedImage">使用特色图片</button>
        </div>

        <!-- 颜色选择器 -->
        <div class="color-picker">
          <div
            v-for="(color, index) in presetColors"
            :key="index"
            class="color-item"
            :style="{ backgroundColor: color }"
            :class="{
              'is-light': color === '#ffffff' || color === '#e0e0e0' || color === '#cfcfcf',
            }"
            @click="selectColor(color)"
          ></div>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*,video/*"
        style="display: none"
        @change="handleFileChange"
      />
    </div>

    <!-- 有背景时：显示封面 -->
    <div
      v-else
      ref="coverRef"
      class="wp-block-cover"
      :class="{
        'is-selected': isSelected,
        'is-resizing': isResizing,
        'has-dark-text': useDarkText,
      }"
      :style="coverStyle"
    >
      <div class="wp-block-cover__inner-container" :style="{ textAlign: textAlign }">
        <RichTextEditor
          ref="editorRef"
          v-model="title"
          tag="p"
          class="cover-title"
          :text-align="textAlign"
          placeholder="输入标题…"
          @change-complete="handleChangeComplete"
        />
      </div>

      <!-- 尺寸指示器（拖拽时显示） -->
      <div v-if="isResizing" class="size-indicator">
        {{ coverWidth || '100%' }} x {{ currentHeight }}
      </div>

      <!-- 底部拖拽手柄（选中时显示） -->
      <div v-if="isSelected" class="resize-handle" @mousedown="onResizeStart">
        <span class="handle-circle"></span>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*,video/*"
        style="display: none"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>

<style scoped>
/* ========== 外层包裹 ========== */
.wp-block-cover-wrapper {
  width: 100%;
}

/* ========== 工具栏 ========== */
.cover-toolbar {
  margin-bottom: 8px;
}

/* ========== 占位符样式 ========== */
.wp-block-cover-placeholder {
  border: 1px solid #1e1e1e;
  border-radius: 2px;
  box-sizing: border-box;
  padding: 24px 28px;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #1e1e1e;
}

.header .icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.header .icon :deep(svg) {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.tips {
  color: #757575;
  font-size: 14px;
}

.button-row {
  display: flex;
  gap: 12px;
}

.button-row .button {
  font-size: 14px;
  padding: 8px 16px;
  border: 1.5px solid #3858e9;
  background: white;
  color: #3858e9;
  border-radius: 3px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.button-row .button.primary {
  background: #3858e9;
  color: white;
}

.button-row .button:hover {
  background: #e9f2ff;
}

.button-row .button.primary:hover {
  background: #2145e6;
}

/* 颜色选择器 */
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.color-item {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease;
  box-sizing: border-box;
}

.color-item:hover {
  transform: scale(1.1);
}

.color-item.is-light {
  border: 1px solid #ddd;
}

/* ========== 封面样式 ========== */
.wp-block-cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  overflow: visible;
}

/* 选中时显示蓝色边框 */
.wp-block-cover.is-selected,
.wp-block-cover.is-resizing {
  outline: 1.5px solid #3858e9;
  outline-offset: 2px;
}

.wp-block-cover__inner-container {
  position: relative;
  z-index: 1;
  padding: 20px;
  width: 100%;
}

.cover-title {
  color: #fff;
  font-size: 2em;
  font-weight: 600;
  margin: 0;
}

/* 浅色背景时使用深色文字 */
.wp-block-cover.has-dark-text .cover-title {
  color: #1e1e1e;
}

.wp-block-cover.has-dark-text .cover-title :deep(a) {
  color: #3858e9;
}

/* 富文本格式 */
.cover-title :deep(strong),
.cover-title :deep(b) {
  font-weight: bold;
}

.cover-title :deep(em),
.cover-title :deep(i) {
  font-style: italic;
}

.cover-title :deep(s),
.cover-title :deep(del) {
  text-decoration: line-through;
}

.cover-title :deep(code) {
  font-family: monospace;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.1em 0.3em;
  border-radius: 2px;
}

.wp-block-cover.has-dark-text .cover-title :deep(code) {
  background: rgba(0, 0, 0, 0.1);
}

.cover-title :deep(a) {
  color: #90caf9;
  text-decoration: underline;
}

.cover-title :deep(mark) {
  padding: 0.1em 0;
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
