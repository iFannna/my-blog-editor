<template>
  <div
    class="wp-block-image"
    :class="{ 'is-selected': isSelected }"
    @click="toggleSelect"
    tabindex="0"
  >
    <div class="header">
      <span class="icon" v-html="imageIcon"></span>
      <span>图片</span>
    </div>
    <div class="tips">拖放图片、上传或从你的库中选择。</div>
    <div class="button-row">
      <button class="button" @click.stop="onUpload">上传</button>
      <button class="button" @click.stop="onMediaLibrary">媒体库</button>
      <button class="button" @click.stop="onInsertUrl">URL插入</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getIcon } from '@/icons/index.js'
const imageIcon = getIcon('image')
const isSelected = ref(false)

function toggleSelect() {
  isSelected.value = !isSelected.value
}
function onUpload(e) {
  // 上传逻辑
}
function onMediaLibrary(e) {
  // 打开媒体库逻辑
}
function onInsertUrl(e) {
  // 插入链接逻辑
}
</script>

<style scoped></style>
