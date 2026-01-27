<script setup>
import { toRef, computed, watch, nextTick } from 'vue'
import { useRichText } from '../useRichText.js'

const props = defineProps({
  modelValue: String,
  placeholder: String,
  tag: { type: String, default: 'div' },
  textAlign: String,
})

const emit = defineEmits(['update:modelValue', 'change-complete'])

const { editorRef, format, isFormatActive, syncFromDOM } = useRichText({
  value: toRef(props, 'modelValue'),
  onChange: (html) => emit('update:modelValue', html),
  onChangeComplete: () => emit('change-complete'),
})
// 只判定内容为空即显示placeholder
const isEmpty = computed(() => {
  let val = props.modelValue
  return !val || val === '<br>' || val.replace(/<[^>]+>/g, '').trim() === ''
})

// 保证切换 tag 不丢失内容
watch(
  () => props.tag,
  () => {
    nextTick(() => {
      if (editorRef.value && props.modelValue) {
        editorRef.value.innerHTML = props.modelValue
      }
    })
  },
)

defineExpose({ format, isFormatActive, syncFromDOM })
</script>

<template>
  <component
    :is="tag"
    ref="editorRef"
    class="block-editor-rich-text"
    :style="{ textAlign }"
    contenteditable="true"
    :data-empty="isEmpty"
    :data-placeholder="placeholder"
  ></component>
</template>

<style scoped>
.block-editor-rich-text {
  position: relative;
  min-height: 1.5em;
}

.block-editor-rich-text[data-empty='true']::before {
  content: attr(data-placeholder);
  color: #949494;
  pointer-events: none;
  font-size: inherit;
  position: absolute;
  left: 0.1em;
  top: 0.2em;
  opacity: 1;
}
.block-editor-rich-text[data-empty='false']::before {
  content: none;
}
</style>
