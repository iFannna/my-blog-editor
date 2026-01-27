<script setup>
import { computed } from 'vue'
import { useEditorStore } from '../../editor/store.js'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()

const text = computed({
  get: function () {
    return props.attributes.text || '按钮'
  },
  set: function (val) {
    emit('update:attributes', { text: val })
  },
})

const url = computed({
  get: function () {
    return props.attributes.url || ''
  },
  set: function (val) {
    emit('update:attributes', { url: val })
  },
})

const backgroundColor = computed({
  get: function () {
    return props.attributes.backgroundColor || '#1e1e1e'
  },
  set: function (val) {
    emit('update:attributes', { backgroundColor: val })
    store.commitBlockChanges()
  },
})

const textColor = computed({
  get: function () {
    return props.attributes.textColor || '#ffffff'
  },
  set: function (val) {
    emit('update:attributes', { textColor: val })
    store.commitBlockChanges()
  },
})

const buttonStyle = computed(function () {
  return {
    backgroundColor: backgroundColor.value,
    color: textColor.value,
  }
})

function handleTextChange(e) {
  text.value = e.target.textContent
  store.commitBlockChanges()
}

function handleUrlChange(e) {
  url.value = e.target.value
  store.commitBlockChanges()
}
</script>

<template>
  <div class="wp-block-button">
    <a
      class="wp-block-button__link"
      href="javascript:void(0)"
      :style="buttonStyle"
      contenteditable="true"
      @blur="handleTextChange"
      >{{ text }}</a
    >

    <div v-if="isSelected" class="button-settings">
      <div class="setting-row">
        <label>链接</label>
        <input type="text" placeholder="输入链接地址" :value="url" @change="handleUrlChange" />
      </div>
      <div class="setting-row">
        <label>背景色</label>
        <input type="color" v-model="backgroundColor" />
      </div>
      <div class="setting-row">
        <label>文字色</label>
        <input type="color" v-model="textColor" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.wp-block-button {
  display: inline-block;
}
.wp-block-button__link {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 16px;
  outline: none;
  cursor: text;
}
.button-settings {
  margin-top: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
}
.setting-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.setting-row:last-child {
  margin-bottom: 0;
}
.setting-row label {
  width: 60px;
  font-size: 12px;
  color: #757575;
}
.setting-row input[type='text'] {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}
.setting-row input[type='color'] {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}
</style>
