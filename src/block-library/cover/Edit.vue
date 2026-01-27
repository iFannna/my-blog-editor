<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import RichTextEditor from '../../editor/components/RichTextEditor.vue'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()
const fileInput = ref(null)

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

const coverStyle = computed(function () {
  var style = { minHeight: minHeight.value + 'px' }
  if (url.value) {
    style.backgroundImage = 'url(' + url.value + ')'
  }
  return style
})

function handleUploadClick() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  var file = e.target.files && e.target.files[0]
  if (file) {
    var reader = new FileReader()
    reader.onload = function () {
      url.value = reader.result
      store.commitBlockChanges()
    }
    reader.readAsDataURL(file)
  }
}

function handleUrlInput() {
  var inputUrl = prompt('请输入背景图片地址:')
  if (inputUrl) {
    url.value = inputUrl
    store.commitBlockChanges()
  }
}

function handleChangeComplete() {
  store.commitBlockChanges()
}
</script>

<template>
  <div class="wp-block-cover" :style="coverStyle">
    <span class="wp-block-cover__background" :style="{ background: overlayColor }"></span>

    <div v-if="isSelected && !url" class="cover-placeholder">
      <button type="button" @click="handleUploadClick">上传图片</button>
      <button type="button" @click="handleUrlInput">输入URL</button>
    </div>

    <div class="wp-block-cover__inner-container">
      <RichTextEditor
        v-model="title"
        tag="p"
        class="cover-title"
        placeholder="输入标题…"
        @change-complete="handleChangeComplete"
      />
    </div>

    <div v-if="isSelected && url" class="cover-toolbar">
      <label>
        高度:
        <input type="number" v-model.number="minHeight" min="100" max="800" />px
      </label>
      <button type="button" @click="handleUploadClick">更换图片</button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<style scoped>
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
.cover-placeholder {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 8px;
}
.cover-placeholder button {
  padding: 8px 16px;
  border: 1px solid #fff;
  border-radius: 4px;
  background: transparent;
  color: #fff;
  cursor: pointer;
}
.cover-placeholder button:hover {
  background: rgba(255, 255, 255, 0.2);
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
</style>
