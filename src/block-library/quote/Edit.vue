<script setup>
import { ref, computed, watch } from 'vue'
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
const contentRef = ref(null)
const citationRef = ref(null)
const activeEditorRef = ref(null)

const content = computed({
  get: function () {
    return props.attributes.content || ''
  },
  set: function (val) {
    emit('update:attributes', { content: val })
  },
})

const citation = computed({
  get: function () {
    return props.attributes.citation || ''
  },
  set: function (val) {
    emit('update:attributes', { citation: val })
  },
})

function handleChangeComplete() {
  store.commitBlockChanges()
}

function handleContentFocus() {
  activeEditorRef.value = contentRef.value
}

function handleCitationFocus() {
  activeEditorRef.value = citationRef.value
}

// 监听选中状态变化
watch(
  function () {
    return props.isSelected
  },
  function (selected) {
    if (!selected) {
      activeEditorRef.value = null
    } else if (!activeEditorRef.value) {
      activeEditorRef.value = contentRef.value
    }
  },
)
</script>

<template>
  <div class="quote-block-wrapper">
    <!-- 工具栏 -->
    <div v-if="isSelected" class="block-editor-format-toolbar quote-toolbar">
      <!-- 富文本格式工具栏 -->
      <FormatToolbar :editor-ref="activeEditorRef || contentRef" />
    </div>

    <blockquote class="wp-block-quote">
      <RichTextEditor
        ref="contentRef"
        v-model="content"
        tag="p"
        placeholder="输入引用内容…"
        @focus="handleContentFocus"
        @change-complete="handleChangeComplete"
      />
      <RichTextEditor
        v-if="isSelected || citation"
        ref="citationRef"
        v-model="citation"
        tag="cite"
        placeholder="引用来源"
        @focus="handleCitationFocus"
        @change-complete="handleChangeComplete"
      />
    </blockquote>
  </div>
</template>

<style scoped>
.quote-block-wrapper {
  position: relative;
}

.quote-toolbar {
  margin-bottom: 8px;
}

.wp-block-quote {
  margin: 0;
  padding: 10px 20px;
  border-left: 4px solid #1e1e1e;
}

.wp-block-quote :deep(p) {
  margin: 0 0 8px;
  font-size: 1.1em;
  font-style: italic;
}

.wp-block-quote :deep(cite) {
  display: block;
  font-size: 13px;
  color: #757575;
  font-style: normal;
}

/* 富文本格式 */
.wp-block-quote :deep(strong),
.wp-block-quote :deep(b) {
  font-weight: bold;
}

.wp-block-quote :deep(em),
.wp-block-quote :deep(i) {
  font-style: italic;
}

.wp-block-quote :deep(s),
.wp-block-quote :deep(del) {
  text-decoration: line-through;
}

.wp-block-quote :deep(code) {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.1em 0.3em;
  border-radius: 2px;
}

.wp-block-quote :deep(a) {
  color: #3858e9;
  text-decoration: underline;
}

.wp-block-quote :deep(mark) {
  padding: 0.1em 0;
}
</style>
