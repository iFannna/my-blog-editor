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

const mediaIcon = getIcon('image')
const fileInput = ref(null)
const mediaFigureRef = ref(null)
const editorRef = ref(null)

// 缩放相关
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)
const naturalWidth = ref(0)
const naturalHeight = ref(0)
const currentWidth = ref(0)
const currentHeight = ref(0)

const MAX_MEDIA_WIDTH = 600
const MIN_MEDIA_WIDTH = 100

const mediaUrl = computed({
  get: function () {
    return props.attributes.mediaUrl || ''
  },
  set: function (val) {
    emit('update:attributes', { mediaUrl: val })
  },
})

const mediaWidth = computed({
  get: function () {
    return props.attributes.mediaWidth || ''
  },
  set: function (val) {
    emit('update:attributes', { mediaWidth: val })
  },
})

const mediaPosition = computed({
  get: function () {
    return props.attributes.mediaPosition || 'left'
  },
  set: function (val) {
    emit('update:attributes', { mediaPosition: val })
    store.commitBlockChanges()
  },
})

const content = computed({
  get: function () {
    return props.attributes.content || ''
  },
  set: function (val) {
    emit('update:attributes', { content: val })
  },
})

// 媒体区域宽度
const mediaColumnWidth = computed(function () {
  if (mediaWidth.value) {
    return mediaWidth.value
  }
  return '50%'
})

// 网格布局样式 - 不使用 direction: rtl
const gridStyle = computed(function () {
  var mediaCol = mediaColumnWidth.value
  var contentCol = '1fr'

  if (mediaPosition.value === 'right') {
    return {
      gridTemplateColumns: contentCol + ' minmax(0, ' + mediaCol + ')',
    }
  }
  return {
    gridTemplateColumns: 'minmax(0, ' + mediaCol + ') ' + contentCol,
  }
})

function onUpload() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  var file = e.target.files && e.target.files[0]
  if (file) {
    var reader = new FileReader()
    reader.onload = function () {
      mediaUrl.value = reader.result
      mediaWidth.value = ''
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
        mediaUrl.value = reader.result
        mediaWidth.value = ''
        store.commitBlockChanges()
      }
      reader.readAsDataURL(file)
    }
  }
}

function handleChangeComplete() {
  store.commitBlockChanges()
}

// 图片加载完成
function onImageLoad(e) {
  naturalWidth.value = e.target.naturalWidth
  naturalHeight.value = e.target.naturalHeight
  currentWidth.value = e.target.offsetWidth
  currentHeight.value = e.target.offsetHeight
}

// 开始缩放（手柄在媒体和内容之间）
function onResizeStart(e) {
  e.preventDefault()
  e.stopPropagation()

  isResizing.value = true
  startX.value = e.clientX

  var figure = mediaFigureRef.value
  if (figure) {
    startWidth.value = figure.offsetWidth
    currentWidth.value = startWidth.value

    var img = figure.querySelector('img')
    if (img) {
      currentHeight.value = img.offsetHeight
    }
  }

  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
}

function onResizeMove(e) {
  if (!isResizing.value) return

  var deltaX = e.clientX - startX.value

  // 媒体在右侧时，拖拽方向相反
  if (mediaPosition.value === 'right') {
    deltaX = -deltaX
  }

  var newWidth = startWidth.value + deltaX

  // 限制宽度范围
  if (newWidth < MIN_MEDIA_WIDTH) newWidth = MIN_MEDIA_WIDTH
  if (newWidth > MAX_MEDIA_WIDTH) newWidth = MAX_MEDIA_WIDTH

  // 计算图片高度
  if (naturalWidth.value && naturalHeight.value) {
    var aspectRatio = naturalWidth.value / naturalHeight.value
    currentHeight.value = Math.round(newWidth / aspectRatio)
  }

  currentWidth.value = newWidth
  mediaWidth.value = newWidth + 'px'
}

function onResizeEnd() {
  if (isResizing.value) {
    isResizing.value = false
    store.commitBlockChanges()
  }

  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
}

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
  <div class="wp-block-media-text-wrapper">
    <!-- 工具栏（放在外层容器） -->
    <div v-if="isSelected" class="block-editor-format-toolbar media-text-toolbar">
      <!-- 媒体位置按钮 -->
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': mediaPosition === 'left' }"
        title="媒体在左"
        @click="mediaPosition = 'left'"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path
            d="M3 6h8v12H3V6zm2 2v8h4V8H5zm8-2h8v2h-8V6zm0 4h8v2h-8v-2zm0 4h8v2h-8v-2z"
            fill="currentColor"
          />
        </svg>
      </button>
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': mediaPosition === 'right' }"
        title="媒体在右"
        @click="mediaPosition = 'right'"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path
            d="M13 6h8v12h-8V6zm2 2v8h4V8h-4zM3 6h8v2H3V6zm0 4h8v2H3v-2zm0 4h8v2H3v-2z"
            fill="currentColor"
          />
        </svg>
      </button>

      <div class="format-divider"></div>

      <!-- 富文本工具栏 -->
      <FormatToolbar :editor-ref="editorRef" />
    </div>

    <!-- 主内容区域 -->
    <div
      class="wp-block-media-text"
      :class="{
        'is-selected': isSelected,
        'is-resizing': isResizing,
        'has-media': !!mediaUrl,
      }"
      :style="mediaUrl ? gridStyle : {}"
    >
      <!-- 媒体区域 -->
      <figure
        ref="mediaFigureRef"
        class="wp-block-media-text__media"
        :style="{ order: mediaPosition === 'right' ? 2 : 1 }"
      >
        <template v-if="mediaUrl">
          <img :src="mediaUrl" @load="onImageLoad" />

          <!-- 尺寸指示器（拖拽时显示��� -->
          <div v-if="isResizing" class="size-indicator">
            {{ currentWidth }} x {{ currentHeight }}
          </div>

          <!-- 拖拽手柄（在媒体和内容之间） -->
          <div
            v-if="isSelected"
            class="resize-handle"
            :class="{ 'handle-left': mediaPosition === 'right' }"
            @mousedown="onResizeStart"
          >
            <span class="handle-circle"></span>
          </div>
        </template>

        <!-- 无媒体时：占位符 -->
        <div v-else class="media-placeholder" @dragover.prevent @drop.prevent="handleDrop">
          <div class="placeholder-header">
            <span class="placeholder-icon" v-html="mediaIcon"></span>
            <span>媒体区域</span>
          </div>
          <div class="placeholder-buttons">
            <button class="button primary" @click.stop="onUpload">上传</button>
            <button class="button" @click.stop="onMediaLibrary">媒体库</button>
            <button class="button" @click.stop="onUseFeaturedImage">使用特色图片</button>
          </div>
        </div>
      </figure>

      <!-- 内容区域 -->
      <div
        class="wp-block-media-text__content"
        :style="{ order: mediaPosition === 'right' ? 1 : 2 }"
      >
        <RichTextEditor
          ref="editorRef"
          v-model="content"
          tag="div"
          class="media-text-editor"
          placeholder="输入内容..."
          @change-complete="handleChangeComplete"
        />
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
</template>

<style scoped>
/* ========== 外层包裹 ========== */
.wp-block-media-text-wrapper {
  width: 100%;
}

/* ========== 工具栏 ========== */
.media-text-toolbar {
  margin-bottom: 8px;
}

/* ========== 主容器 ========== */
.wp-block-media-text {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  align-items: stretch;
  width: 100%;
  box-sizing: border-box;
}

/* 无媒体时显示边框 */
.wp-block-media-text:not(.has-media) {
  border: 1px solid #1e1e1e;
  border-radius: 2px;
}

/* 有媒体时无边框 */
.wp-block-media-text.has-media {
  border: none;
}

/* ========== 媒体区域 ========== */
.wp-block-media-text__media {
  margin: 0;
  position: relative;
  min-width: 0;
  max-width: 600px;
}

.wp-block-media-text__media img {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}

/* 只有有媒体且选中时才显示蓝色边框 */
.wp-block-media-text.has-media.is-selected .wp-block-media-text__media,
.wp-block-media-text.has-media.is-resizing .wp-block-media-text__media {
  outline: 1.5px solid #3858e9;
  outline-offset: 2px;
}

/* 拖拽手柄 - 默认在右侧 */
.resize-handle {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  cursor: ew-resize;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 媒体在右侧时，手柄在左边 */
.resize-handle.handle-left {
  right: auto;
  left: -12px;
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

/* 媒体占位符 */
.media-placeholder {
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-right: 1px solid #1e1e1e;
}

/* 媒体在右侧时，占位符边框在左边 */
.wp-block-media-text__media[style*='order: 2'] .media-placeholder {
  border-right: none;
  border-left: 1px solid #1e1e1e;
}

.placeholder-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1e1e1e;
}

.placeholder-icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon :deep(svg) {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.placeholder-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.placeholder-buttons .button {
  width: 100%;
  font-size: 14px;
  padding: 10px 16px;
  border: 1.5px solid #3858e9;
  background: white;
  color: #3858e9;
  border-radius: 3px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  text-align: center;
}

.placeholder-buttons .button.primary {
  background: #3858e9;
  color: white;
}

.placeholder-buttons .button:hover {
  background: #e9f2ff;
}

.placeholder-buttons .button.primary:hover {
  background: #2145e6;
}

/* ========== 内容区域 ========== */
.wp-block-media-text__content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.media-text-editor {
  font-size: 16px;
  line-height: 1.6;
  outline: none;
  min-height: 1.6em;
}

.media-text-editor :deep(p) {
  margin: 0 0 1em;
}

.media-text-editor :deep(p:last-child) {
  margin-bottom: 0;
}

/* 富文本格式 */
.media-text-editor :deep(strong),
.media-text-editor :deep(b) {
  font-weight: bold;
}

.media-text-editor :deep(em),
.media-text-editor :deep(i) {
  font-style: italic;
}

.media-text-editor :deep(s),
.media-text-editor :deep(del) {
  text-decoration: line-through;
}

.media-text-editor :deep(code) {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.1em 0.3em;
  border-radius: 2px;
}

.media-text-editor :deep(a) {
  color: #3858e9;
  text-decoration: underline;
}

.media-text-editor :deep(mark) {
  padding: 0.1em 0;
}
</style>
