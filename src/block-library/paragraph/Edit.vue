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
    <div v-if="isSelected" class="block-editor-format-toolbar paragraph-toolbar">
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': textAlign === 'left' || !textAlign }"
        title="左对齐"
        @click="textAlign = 'left'"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M4 5h16v1.5H4V5zm0 5.5h10V12H4v-1.5zm0 5.5h16v1.5H4V16z" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': textAlign === 'center' }"
        title="居中对齐"
        @click="textAlign = 'center'"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M4 5h16v1.5H4V5zm3 5.5h10V12H7v-1.5zM4 16h16v1.5H4V16z" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': textAlign === 'right' }"
        title="右对齐"
        @click="textAlign = 'right'"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M4 5h16v1.5H4V5zm6 5.5h10V12H10v-1.5zM4 16h16v1.5H4V16z" fill="currentColor" />
        </svg>
      </button>
      <div class="format-divider"></div>
      <!-- 注意：这里传递的是 editorRef（ref 对象），FormatToolbar 需要访问 editorRef.value -->
      <FormatToolbar :editor-ref="editorRef" />
    </div>
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

<style scoped></style>
