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

const coverIcon = getIcon('cover')
const fileInput = ref(null)

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

const overlayColor = computed({
  get: function () {
    return props.attributes.overlayColor || 'rgba(0,0,0,0.5)'
  },
  set: function (val) {
    emit('update:attributes', { overlayColor: val })
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
    store.commitBlockChanges()
  },
})

// 是否有背景（图片或颜色）
const hasBackground = computed(function () {
  return url.value || backgroundColor.value
})

const coverStyle = computed(function () {
  var style = { minHeight: minHeight.value + 'px' }
  if (url.value) {
    style.backgroundImage = 'url(' + url.value + ')'
  } else if (backgroundColor.value) {
    style.backgroundColor = backgroundColor.value
  }
  return style
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
function removeBackground() {
  url.value = ''
  backgroundColor.value = ''
  store.commitBlockChanges()
}
</script>

<template>
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
          :class="{ 'is-light': color === '#ffffff' || color === '#e0e0e0' || color === '#cfcfcf' }"
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
  <div v-else class="wp-block-cover" :style="coverStyle">
    <span class="wp-block-cover__background" :style="{ background: overlayColor }"></span>

    <div class="wp-block-cover__inner-container">
      <RichTextEditor
        v-model="title"
        tag="p"
        class="cover-title"
        placeholder="输入标题…"
        @change-complete="handleChangeComplete"
      />
    </div>

    <div v-if="isSelected" class="cover-toolbar">
      <label>
        高度:
        <input type="number" v-model.number="minHeight" min="100" max="800" />px
      </label>
      <button type="button" @click="onUpload">更换图片</button>
      <button type="button" @click="removeBackground">移除背景</button>
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
  background-color: #1e1e1e;
  border-radius: 4px;
  overflow: hidden;
}

.wp-block-cover__background {
  position: absolute;
  inset: 0;
}

.wp-block-cover__inner-container {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 20px;
  width: 100%;
}

.cover-title {
  color: #fff;
  font-size: 2em;
  font-weight: 600;
  margin: 0;
}

.cover-toolbar {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  font-size: 12px;
}

.cover-toolbar input {
  width: 60px;
  padding: 2px 4px;
  border: 1px solid #ddd;
  border-radius: 2px;
}

.cover-toolbar button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
}

.cover-toolbar button:hover {
  background: #f0f0f0;
}
</style>
