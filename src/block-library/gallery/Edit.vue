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

const images = computed({
  get: function () {
    return props.attributes.images || []
  },
  set: function (val) {
    emit('update:attributes', { images: val })
  },
})

const columns = computed({
  get: function () {
    return props.attributes.columns || 3
  },
  set: function (val) {
    emit('update:attributes', { columns: val })
    store.commitBlockChanges()
  },
})

function handleUploadClick() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  var files = Array.from(e.target.files || [])
  files.forEach(function (file) {
    var reader = new FileReader()
    reader.onload = function () {
      var newImages = images.value.slice()
      newImages.push({ url: reader.result, alt: '' })
      images.value = newImages
      store.commitBlockChanges()
    }
    reader.readAsDataURL(file)
  })
}

function addByUrl() {
  var url = prompt('请输入图片地址:')
  if (url) {
    var newImages = images.value.slice()
    newImages.push({ url: url, alt: '' })
    images.value = newImages
    store.commitBlockChanges()
  }
}

function removeImage(index) {
  var newImages = images.value.slice()
  newImages.splice(index, 1)
  images.value = newImages
  store.commitBlockChanges()
}
</script>

<template>
  <figure class="wp-block-gallery" :class="'columns-' + columns">
    <div v-if="isSelected" class="gallery-toolbar">
      <span>列数：</span>
      <select v-model="columns">
        <option :value="1">1</option>
        <option :value="2">2</option>
        <option :value="3">3</option>
        <option :value="4">4</option>
      </select>
      <button type="button" @click="handleUploadClick">添加图片</button>
      <button type="button" @click="addByUrl">输入URL</button>
    </div>

    <div v-if="images.length > 0" class="gallery-grid">
      <div v-for="(img, index) in images" :key="index" class="gallery-item">
        <img :src="img.url" :alt="img.alt" />
        <button v-if="isSelected" class="remove-btn" @click="removeImage(index)">×</button>
      </div>
    </div>

    <div v-else class="gallery-placeholder" @click="handleUploadClick">
      <div class="placeholder-content">
        <span class="placeholder-icon">◩</span>
        <p>点击添加图片到画廊</p>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="handleFileChange"
    />
  </figure>
</template>

<style scoped>
.wp-block-gallery {
  margin: 0;
}
.gallery-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}
.gallery-toolbar select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.gallery-toolbar button {
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}
.gallery-toolbar button:hover {
  background: #f0f0f0;
}
.gallery-grid {
  display: grid;
  gap: 8px;
}
.columns-1 .gallery-grid {
  grid-template-columns: 1fr;
}
.columns-2 .gallery-grid {
  grid-template-columns: repeat(2, 1fr);
}
.columns-3 .gallery-grid {
  grid-template-columns: repeat(3, 1fr);
}
.columns-4 .gallery-grid {
  grid-template-columns: repeat(4, 1fr);
}
.gallery-item {
  position: relative;
}
.gallery-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}
.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}
.gallery-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f0f0f0;
  border: 2px dashed #ccc;
  border-radius: 4px;
  cursor: pointer;
}
.placeholder-content {
  text-align: center;
  color: #757575;
}
.placeholder-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 8px;
}
</style>
