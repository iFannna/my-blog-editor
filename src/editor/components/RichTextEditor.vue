<script setup>
import { toRef, computed, watch, nextTick } from 'vue'
import { useRichText } from '../useRichText.js'

const props = defineProps({
  modelValue: String,
  placeholder: String,
  tag: { type: String, default: 'div' },
  textAlign: String,
  spellcheck: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change-complete'])

const {
  editorRef,
  format,
  isFormatActive,
  getActiveFormat,
  syncFromDOM,
  getSelection,
  applyHighlight,
  removeHighlightFormat,
} = useRichText({
  value: toRef(props, 'modelValue'),
  onChange: (html) => emit('update:modelValue', html),
  onChangeComplete: () => emit('change-complete'),
})

// 只判定内容为空即显示placeholder
const isEmpty = computed(() => {
  let val = props.modelValue
  return !val || val === '<br>' || val.replace(/<[^>]+>/g, '').trim() === ''
})

// 保证大小换 tag 不丢失内容
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

// 暴露所有需要的方法给父组件
defineExpose({
  format,
  isFormatActive,
  getActiveFormat,
  syncFromDOM,
  getSelection,
  applyHighlight,
  removeHighlightFormat,
})
</script>

<template>
  <component
    :is="tag"
    ref="editorRef"
    class="block-editor-rich-text"
    :style="{ textAlign }"
    contenteditable="true"
    :spellcheck="spellcheck"
    autocorrect="off"
    autocapitalize="off"
    :data-empty="isEmpty"
    :data-placeholder="placeholder"
    :data-align="textAlign || 'left'"
  ></component>
</template>

<style scoped>
.block-editor-rich-text {
  position: relative;
  min-height: 1.5em;
  outline: none;
}

.block-editor-rich-text:empty::before,
.block-editor-rich-text[data-empty='true']::before {
  content: attr(data-placeholder);
  color: #949494;
  pointer-events: none;
  font-size: inherit;
  font-weight: inherit;
  position: absolute;
  top: 0;
  opacity: 1;
}

/* 根据对齐方式定位 placeholder */
.block-editor-rich-text[data-align='left']:empty::before,
.block-editor-rich-text[data-align='left'][data-empty='true']::before {
  left: 0;
  right: auto;
  text-align: left;
}

.block-editor-rich-text[data-align='center']:empty::before,
.block-editor-rich-text[data-align='center'][data-empty='true']::before {
  left: 0;
  right: 0;
  text-align: center;
}

.block-editor-rich-text[data-align='right']:empty::before,
.block-editor-rich-text[data-align='right'][data-empty='true']::before {
  left: auto;
  right: 0;
  text-align: right;
}

.block-editor-rich-text[data-empty='false']::before {
  content: none;
}
</style>
