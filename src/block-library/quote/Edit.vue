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
const contentRef = ref(null)

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
</script>

<template>
  <blockquote class="wp-block-quote">
    <RichTextEditor
      ref="contentRef"
      v-model="content"
      tag="p"
      placeholder="输入引用内容…"
      @change-complete="handleChangeComplete"
    />
    <RichTextEditor
      v-if="isSelected || citation"
      v-model="citation"
      tag="cite"
      placeholder="引用来源"
      @change-complete="handleChangeComplete"
    />
  </blockquote>
</template>

<style scoped>
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
</style>
