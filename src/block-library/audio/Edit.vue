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

function handleUploadClick() {
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
}

function handleUrlInput() {
  var url = prompt('请输入音频地址:')
  if (url) {
    src.value = url
    store.commitBlockChanges()
  }
}

function handleCaptionChange(e) {
  caption.value = e.target.value
  store.commitBlockChanges()
}
</script>

<template>
  <figure class="wp-block-audio">
    <template v-if="src">
      <audio controls :src="src"></audio>
      <input
        v-if="isSelected"
        type="text"
        class="caption-input"
        placeholder="添加说明…"
        :value="caption"
        @change="handleCaptionChange"
      />
      <figcaption v-else-if="caption">{{ caption }}</figcaption>
    </template>

    <div v-else class="audio-placeholder">
      <div class="placeholder-content">
        <span class="placeholder-icon">₰</span>
        <p>添加音频</p>
        <div class="placeholder-buttons">
          <button type="button" @click="handleUploadClick">上传</button>
          <button type="button" @click="handleUrlInput">输入URL</button>
        </div>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="audio/*"
      style="display: none"
      @change="handleFileChange"
    />
  </figure>
</template>

<style scoped>
.wp-block-audio {
  margin: 0;
}
.wp-block-audio audio {
  width: 100%;
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
}
.wp-block-audio figcaption {
  margin-top: 8px;
  font-size: 12px;
  color: #757575;
  text-align: center;
}
.audio-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
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
.placeholder-buttons button:hover {
  background: #007cba;
  color: #fff;
}
</style>
