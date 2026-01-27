<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import RichTextEditor from '../../editor/components/RichTextEditor.vue'
import FormatToolbar from '../../editor/components/FormatToolbar.vue'

const props = defineProps({
  attributes: Object,
  clientId: String,
  isSelected: Boolean,
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()
const editorRef = ref(null)

// 保证是响应式对象
const content = computed({
  get: () => props.attributes.content || '',
  set: (val) => emit('update:attributes', { content: val }),
})

// H标签变动
const level = computed({
  get: () => props.attributes.level || 2,
  set: (val) => {
    emit('update:attributes', { level: val })
    store.commitBlockChanges()
  },
})
const textAlign = computed({
  get: () => props.attributes.textAlign || 'left',
  set: (val) => {
    emit('update:attributes', { textAlign: val })
    store.commitBlockChanges()
  },
})
const tagName = computed(() => 'h' + level.value)
function setLevel(l) {
  level.value = l
}
function handleChangeComplete() {
  store.commitBlockChanges()
}

// 保证切换tag时内容不丢
watch(level, () => {
  nextTick(() => {
    if (editorRef.value && content.value) {
      editorRef.value.innerHTML = content.value
    }
  })
})
</script>

<template>
  <div class="heading-block-wrapper">
    <div v-if="isSelected" class="block-editor-format-toolbar heading-toolbar">
      <button
        v-for="l in [1, 2, 3, 4, 5, 6]"
        :key="l"
        type="button"
        class="format-button"
        :class="{ 'is-active': level === l }"
        @click="setLevel(l)"
      >
        H{{ l }}
      </button>
      <div class="format-divider"></div>
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
      <FormatToolbar :editor-ref="editorRef" />
    </div>
    <RichTextEditor
      ref="editorRef"
      v-model="content"
      :tag="tagName"
      class="wp-block-heading"
      :text-align="textAlign"
      placeholder="输入标题…"
      @change-complete="handleChangeComplete"
    />
  </div>
</template>
