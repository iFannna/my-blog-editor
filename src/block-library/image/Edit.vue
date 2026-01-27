<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  attributes: {
    type: Object,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:attributes'])

const fileInput = ref(null)

const url = computed({
  get: function () {
    return props.attributes.url || ''
  },
  set: function (val) {
    emit('update:attributes', { url: val })
  },
})

const alt = computed({
  get: function () {
    return props.attributes.alt || ''
  },
  set: function (val) {
    emit('update:attributes', { alt: val })
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
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function handleFileChange(e) {
  const file = e.target.files && e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = function () {
      url.value = reader.result
    }
    reader.readAsDataURL(file)
  }
}

function handleUrlInput() {
  const inputUrl = prompt('请输入图片地址:', url.value)
  if (inputUrl) {
    url.value = inputUrl
  }
}
</script>

<template>
  <figure class="wp-block-image">
    <!-- 已有图片 -->
    <template v-if="url">
      <img :src="url" :alt="alt" />

      <!-- 编辑状态显示说明输入框 -->
      <input
        v-if="isSelected"
        v-model="caption"
        type="text"
        class="caption-input"
        placeholder="添加图片说明…"
      />

      <!-- 非编辑状态显示说明文字 -->
      <figcaption v-else-if="caption">{{ caption }}</figcaption>
    </template>

    <!-- 无图片时显示占位符 -->
    <template v-else>
      <div class="image-placeholder" @click="handleUploadClick">
        <div class="placeholder-content">
          <span class="placeholder-icon">◩</span>
          <p>点击上传图片</p>
          <button type="button" class="placeholder-button" @click.stop="handleUrlInput">
            或输入图片地址
          </button>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileChange"
      />
    </template>
  </figure>
</template>
