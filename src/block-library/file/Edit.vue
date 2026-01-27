<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../../editor/store.js'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()
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

function handleUploadClick() {
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
}

function handleUrlInput() {
  var url = prompt('请输入文件地址:')
  if (url) {
    href.value = url
    fileName.value = url.split('/').pop() || '文件'
    store.commitBlockChanges()
  }
}

function handleNameChange(e) {
  fileName.value = e.target.textContent
  store.commitBlockChanges()
}
</script>

<template>
  <div class="wp-block-file">
    <template v-if="href">
      <a class="file-link" href="javascript:void(0)">
        <span class="file-name" contenteditable="true" @blur="handleNameChange">{{
          fileName
        }}</span>
      </a>
    </template>

    <div v-else class="file-placeholder">
      <div class="placeholder-content">
        <span class="placeholder-icon">▨</span>
        <p>添加文件</p>
        <div class="placeholder-buttons">
          <button type="button" @click="handleUploadClick">上传</button>
          <button type="button" @click="handleUrlInput">输入URL</button>
        </div>
      </div>
    </div>

    <input ref="fileInput" type="file" style="display: none" @change="handleFileChange" />
  </div>
</template>

<style scoped>
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
  color: #007cba;
  text-decoration: none;
}
.file-icon {
  font-size: 24px;
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
.file-options {
  width: 100%;
  margin-top: 8px;
  font-size: 12px;
}
.file-placeholder {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  background: #f0f0f0;
  border: 2px dashed #ccc;
  border-radius: 4px;
}
.placeholder-content {
  text-align: center;
  color: #757575;
}
.placeholder-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 8px;
}
.placeholder-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}
.placeholder-buttons button {
  padding: 6px 16px;
  border: 1px solid #007cba;
  border-radius: 4px;
  background: #fff;
  color: #007cba;
  cursor: pointer;
}
</style>
