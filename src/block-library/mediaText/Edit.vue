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

function handleUploadClick() {
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
}

function handleUrlInput() {
  var url = prompt('请输入图片地址:')
  if (url) {
    mediaUrl.value = url
    store.commitBlockChanges()
  }
}

function handleChangeComplete() {
  store.commitBlockChanges()
}
</script>

<template>
  <div class="wp-block-media-text" :class="'is-media-' + mediaPosition">
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

    <figure class="wp-block-media-text__media">
      <template v-if="mediaUrl">
        <img :src="mediaUrl" />
      </template>
      <div v-else class="media-placeholder" @click="handleUploadClick">
        <span>◩</span>
        <p>添加媒体</p>
        <button type="button" @click.stop="handleUrlInput">输入URL</button>
      </div>
    </figure>

    <div class="wp-block-media-text__content">
      <RichTextEditor
        v-model="content"
        tag="p"
        placeholder="输入内容…"
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
.wp-block-media-text {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: center;
}
.wp-block-media-text.is-media-right {
  direction: rtl;
}
.wp-block-media-text.is-media-right > * {
  direction: ltr;
}
.media-text-toolbar {
  grid-column: 1 / -1;
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
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
.wp-block-media-text__media {
  margin: 0;
}
.wp-block-media-text__media img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}
.media-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f0f0f0;
  border: 2px dashed #ccc;
  border-radius: 4px;
  cursor: pointer;
  color: #757575;
}
.media-placeholder span {
  font-size: 36px;
}
.media-placeholder button {
  margin-top: 8px;
  padding: 4px 12px;
  border: 1px solid #007cba;
  border-radius: 4px;
  background: #fff;
  color: #007cba;
  cursor: pointer;
}
.wp-block-media-text__content {
  padding: 16px;
}
.wp-block-media-text__content :deep(p) {
  margin: 0;
}
</style>
