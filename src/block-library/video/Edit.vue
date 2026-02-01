<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import { getIcon } from '@/icons/index.js'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()

const videoIcon = getIcon('video')
const fileInput = ref(null)

const src = computed({
  get: function () {
    return props.attributes.src || ''
  },
  set: function (val) {
    emit('update:attributes', { src: val })
  },
})

const caption = computed({
  get: function () {
    return props.attributes.caption || ''
  },
  set: function (val) {
    emit('update:attributes', { caption: val })
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
      src.value = reader.result
      store.commitBlockChanges()
    }
    reader.readAsDataURL(file)
  }
  e.target.value = ''
}

function onInsertUrl() {
  var url = prompt('请输入视频地址:')
  if (url) {
    src.value = url
    store.commitBlockChanges()
  }
}

function onMediaLibrary() {
  alert('媒体库功能待实现')
}

function handleDrop(e) {
  var files = e.dataTransfer.files
  if (files && files.length > 0) {
    var file = files[0]
    if (file.type.startsWith('video/')) {
      var reader = new FileReader()
      reader.onload = function () {
        src.value = reader.result
        store.commitBlockChanges()
      }
      reader.readAsDataURL(file)
    }
  }
}

function handleCaptionChange(e) {
  caption.value = e.target.value
  store.commitBlockChanges()
}
</script>

<template>
  <!-- 无视频时：占位符 -->
  <div v-if="!src" class="wp-block-video" @dragover.prevent @drop.prevent="handleDrop">
    <div class="header">
      <span class="icon" v-html="videoIcon"></span>
      <span>视频</span>
    </div>
    <div class="tips">拖放视频、上传或从你的库中选择。</div>
    <div class="button-row">
      <button class="button" @click.stop="onUpload">上传</button>
      <button class="button" @click.stop="onMediaLibrary">媒体库</button>
      <button class="button" @click.stop="onInsertUrl">URL插入</button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="video/*"
      style="display: none"
      @change="handleFileChange"
    />
  </div>

  <!-- 有视频时：显示播放器 -->
  <figure v-else class="wp-block-video has-video">
    <video controls :src="src"></video>
    <input
      v-if="isSelected"
      type="text"
      class="caption-input"
      placeholder="添加说明…"
      :value="caption"
      @change="handleCaptionChange"
    />
    <figcaption v-else-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
/* ========== 占位符样式（与图片区块一致） ========== */
.wp-block-video:not(.has-video) {
  border: 1px solid #1e1e1e;
  border-radius: 2px;
  box-sizing: border-box;
  min-height: 150px;
  padding: 24px 28px 22px 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  position: relative;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #434343;
  margin-bottom: 8px;
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
  color: #888;
  margin-bottom: 20px;
  font-size: 14px;
}

.button-row {
  display: flex;
  gap: 12px;
}

.button-row .button {
  font-size: 15px;
  padding: 7px 18px;
  border: 1.5px solid #3858e9;
  background: white;
  color: #3858e9;
  border-radius: 3px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  min-width: 72px;
}

.button-row .button:first-child {
  background: #3858e9;
  color: white;
}

.button-row .button:hover {
  background: #e9f2ff;
}

.button-row .button:first-child:hover {
  background: #2145e6;
}

/* ========== 视频播放器样式 ========== */
.wp-block-video.has-video {
  margin: 0;
}

.wp-block-video video {
  width: 100%;
  border-radius: 4px;
}

.caption-input {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  box-sizing: border-box;
}

.caption-input:focus {
  outline: none;
  border-color: #3858e9;
}

.wp-block-video figcaption {
  margin-top: 8px;
  font-size: 12px;
  color: #757575;
  text-align: center;
}
</style>
