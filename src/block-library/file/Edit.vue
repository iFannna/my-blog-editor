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

const fileIcon = getIcon('file')
const fileInput = ref(null)

const href = computed({
  get: function () {
    return props.attributes.href || ''
  },
  set: function (val) {
    emit('update:attributes', { href: val })
  },
})

const fileName = computed({
  get: function () {
    return props.attributes.fileName || ''
  },
  set: function (val) {
    emit('update:attributes', { fileName: val })
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
      href.value = reader.result
      fileName.value = file.name
      store.commitBlockChanges()
    }
    reader.readAsDataURL(file)
  }
  e.target.value = ''
}

function onMediaLibrary() {
  alert('媒体库功能待实现')
}

function handleDrop(e) {
  var files = e.dataTransfer.files
  if (files && files.length > 0) {
    var file = files[0]
    var reader = new FileReader()
    reader.onload = function () {
      href.value = reader.result
      fileName.value = file.name
      store.commitBlockChanges()
    }
    reader.readAsDataURL(file)
  }
}

function handleNameChange(e) {
  fileName.value = e.target.textContent
  store.commitBlockChanges()
}
</script>

<template>
  <!-- 无文件时：占位符 -->
  <div v-if="!href" class="wp-block-file-placeholder" @dragover.prevent @drop.prevent="handleDrop">
    <div class="placeholder-content">
      <div class="header">
        <span class="icon" v-html="fileIcon"></span>
        <span>档案</span>
      </div>
      <div class="tips">拖放文件、上传或从你的图书馆中选择。</div>
      <div class="button-row">
        <button class="button primary" @click.stop="onUpload">上传</button>
        <button class="button" @click.stop="onMediaLibrary">媒体库</button>
      </div>
    </div>

    <input ref="fileInput" type="file" style="display: none" @change="handleFileChange" />
  </div>

  <!-- 有文件时：显示文件信息 -->
  <div v-else class="wp-block-file">
    <a class="file-link" href="javascript:void(0)">
      <span class="file-icon" v-html="fileIcon"></span>
      <span class="file-name" contenteditable="true" @blur="handleNameChange">{{ fileName }}</span>
    </a>
    <a class="wp-block-file__button" href="javascript:void(0)">下载</a>
  </div>
</template>

<style scoped>
/* ========== 占位符样式 ========== */
.wp-block-file-placeholder {
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

/* ========== 文件样式 ========== */
.wp-block-file {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3858e9;
  text-decoration: none;
}

.file-icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.file-icon :deep(svg) {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.file-name {
  outline: none;
}

.file-name:focus {
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 2px;
}

.wp-block-file__button {
  padding: 6px 16px;
  background: #1e1e1e;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  font-size: 13px;
}

.wp-block-file__button:hover {
  background: #333;
}
</style>
