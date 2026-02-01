<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import { getIcon } from '@/icons/index.js'
import RichTextEditor from '../../editor/components/RichTextEditor.vue'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()

const mediaIcon = getIcon('image')
const fileInput = ref(null)

const mediaUrl = computed({
  get: function () {
    return props.attributes.mediaUrl || ''
  },
  set: function (val) {
    emit('update:attributes', { mediaUrl: val })
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

function onUpload() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  var file = e.target.files && e.target.files[0]
  if (file) {
    var reader = new FileReader()
    reader.onload = function () {
      mediaUrl.value = reader.result
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
        store.commitBlockChanges()
      }
      reader.readAsDataURL(file)
    }
  }
}

function handleChangeComplete() {
  store.commitBlockChanges()
}
</script>

<template>
  <div class="wp-block-media-text" :class="'is-media-' + mediaPosition">
    <!-- 工具栏 -->
    <div v-if="isSelected" class="media-text-toolbar">
      <button
        type="button"
        :class="{ active: mediaPosition === 'left' }"
        @click="mediaPosition = 'left'"
      >
        媒体在左
      </button>
      <button
        type="button"
        :class="{ active: mediaPosition === 'right' }"
        @click="mediaPosition = 'right'"
      >
        媒体在右
      </button>
    </div>

    <!-- 媒体区域 -->
    <figure class="wp-block-media-text__media">
      <template v-if="mediaUrl">
        <img :src="mediaUrl" />
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
    <div class="wp-block-media-text__content">
      <RichTextEditor
        v-model="content"
        tag="p"
        placeholder="Content..."
        @change-complete="handleChangeComplete"
      />
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
/* ========== 主容器 ========== */
.wp-block-media-text {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  align-items: stretch;
  border: 1px solid #1e1e1e;
  border-radius: 2px;
}

.wp-block-media-text.is-media-right {
  direction: rtl;
}

.wp-block-media-text.is-media-right > * {
  direction: ltr;
}

/* ========== 工具栏 ========== */
.media-text-toolbar {
  grid-column: 1 / -1;
  display: flex;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.media-text-toolbar button {
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
}

.media-text-toolbar button.active {
  background: #1e1e1e;
  color: #fff;
  border-color: #1e1e1e;
}

/* ========== 媒体区域 ========== */
.wp-block-media-text__media {
  margin: 0;
  display: flex;
  align-items: stretch;
}

.wp-block-media-text__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.is-media-right .media-placeholder {
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
  align-items: center;
}

.wp-block-media-text__content :deep(p) {
  margin: 0;
  color: #757575;
  font-size: 16px;
}
</style>
