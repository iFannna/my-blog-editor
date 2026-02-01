<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import RichTextEditor from '../../editor/components/RichTextEditor.vue'
import FormatToolbar from '../../editor/components/FormatToolbar.vue'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()
const editorRef = ref(null)

const content = computed({
  get: function () {
    return props.attributes.content || ''
  },
  set: function (val) {
    emit('update:attributes', { content: val })
  },
})

function handleChangeComplete() {
  store.commitBlockChanges()
}
</script>

<template>
  <div class="verse-block-wrapper">
    <!-- 工具栏 -->
    <div v-if="isSelected" class="block-editor-format-toolbar verse-toolbar">
      <FormatToolbar :editor-ref="editorRef" />
    </div>

    <RichTextEditor
      ref="editorRef"
      v-model="content"
      tag="pre"
      class="wp-block-verse"
      placeholder="写下你的诗歌…"
      @change-complete="handleChangeComplete"
    />
  </div>
</template>

<style scoped>
.verse-block-wrapper {
  position: relative;
}

.verse-toolbar {
  margin-bottom: 8px;
}

.wp-block-verse {
  margin: 0;
  padding: 16px;
  background: #f9f9f9;
  border-left: 4px solid #ddd;
  font-family: Georgia, serif;
  font-size: 16px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-wrap: break-word;
  min-height: auto !important;
}

/* 覆盖 RichTextEditor 的最小高度 */
.wp-block-verse.block-editor-rich-text {
  min-height: 1.8em;
}

/* 修复 placeholder 位置 - 不使用绝对定位 */
.wp-block-verse.block-editor-rich-text:empty::before,
.wp-block-verse.block-editor-rich-text[data-empty='true']::before {
  position: static !important;
  opacity: 0.6;
}

/* 富文本格式 */
.wp-block-verse :deep(strong),
.wp-block-verse :deep(b) {
  font-weight: bold;
}

.wp-block-verse :deep(em),
.wp-block-verse :deep(i) {
  font-style: italic;
}

.wp-block-verse :deep(s),
.wp-block-verse :deep(del) {
  text-decoration: line-through;
}

.wp-block-verse :deep(code) {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.1em 0.3em;
  border-radius: 2px;
}

.wp-block-verse :deep(a) {
  color: #3858e9;
  text-decoration: underline;
}

.wp-block-verse :deep(mark) {
  padding: 0.1em 0;
}
</style>
