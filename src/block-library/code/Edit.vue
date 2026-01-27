<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useEditorStore } from '../../editor/store.js'

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
const codeRef = ref(null)
const isComposing = ref(false)

const content = computed({
  get: function () {
    return props.attributes.content || ''
  },
  set: function (val) {
    emit('update:attributes', { content: val })
  },
})

function handleInput(e) {
  content.value = e.target.textContent || ''

  // 只有不在组合输入时才保存历史
  if (!isComposing.value) {
    store.commitBlockChanges()
  }
}

function handleCompositionStart() {
  isComposing.value = true
}

function handleCompositionEnd(e) {
  isComposing.value = false
  content.value = e.target.textContent || ''
  store.commitBlockChanges()
}

onMounted(function () {
  if (codeRef.value && content.value) {
    codeRef.value.textContent = content.value
  }
})

watch(content, function (newVal) {
  if (codeRef.value && codeRef.value.textContent !== newVal) {
    codeRef.value.textContent = newVal
  }
})
</script>

<template>
  <pre class="wp-block-code">
    <code
      ref="codeRef"
      contenteditable="true"
      spellcheck="false"
      data-placeholder="输入代码…"
      @input="handleInput"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
    ></code>
  </pre>
</template>
