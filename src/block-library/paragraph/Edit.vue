<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import RichTextEditor from '../../editor/components/RichTextEditor.vue'
import FormatToolbar from '../../editor/components/FormatToolbar.vue'

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

const textAlign = computed({
  get: function () {
    return props.attributes.textAlign || 'left'
  },
  set: function (val) {
    emit('update:attributes', { textAlign: val })
    store.commitBlockChanges()
  },
})

function handleChangeComplete() {
  store.commitBlockChanges()
}
</script>

<template>
  <div class="paragraph-block-wrapper">
    <FormatToolbar
      v-if="isSelected"
      :editor-ref="editorRef"
      :show-align="true"
      :text-align="textAlign"
      @update:text-align="textAlign = $event"
    />
    <RichTextEditor
      ref="editorRef"
      v-model="content"
      tag="p"
      class="wp-block-paragraph"
      :text-align="textAlign"
      placeholder="输入文字，或按 / 选择块类型"
      @change-complete="handleChangeComplete"
    />
  </div>
</template>
