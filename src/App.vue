<script setup>
import { ref } from 'vue'
import Editor from './editor/components/Editor.vue'

const content = ref('')

function handleSave() {
  console.log('保存草稿:')
  console.log(content.value)
  alert('草稿已保存！')
}

function handlePublish() {
  console.log('发布内容:')
  console.log(content.value)
  alert('文章已发布！')
}
</script>

<template>
  <Editor v-model="content" @save="handleSave" @publish="handlePublish" />
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}
</style>
