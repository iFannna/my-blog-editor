<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useEditorStore } from '../../editor/store.js'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()
const verseRef = ref(null)
const isComposing = ref(false)

const content = computed({
  get: function () {
    return props.attributes.content || ''
  },
  set: function (val) {
    emit('update:attributes', { content: val })
  },
})

function handleInput() {
  if (verseRef.value) {
    content.value = verseRef.value.innerText
    if (!isComposing.value) {
      store.commitBlockChanges()
    }
  }
}

function handleCompositionStart() {
  isComposing.value = true
}
function handleCompositionEnd() {
  isComposing.value = false
  handleInput()
}

onMounted(function () {
  if (verseRef.value && content.value) {
    verseRef.value.innerText = content.value
  }
})

watch(content, function (newVal) {
  if (verseRef.value && verseRef.value.innerText !== newVal) {
    verseRef.value.innerText = newVal
  }
})
</script>

<template>
  <pre
    ref="verseRef"
    class="wp-block-verse"
    contenteditable="true"
    data-placeholder="写下你的诗歌…"
    @input="handleInput"
    @compositionstart="handleCompositionStart"
    @compositionend="handleCompositionEnd"
  ></pre>
</template>

<style scoped>
.wp-block-verse {
  margin: 0;
  padding: 16px;
  background: #f9f9f9;
  border-left: 4px solid #ddd;
  font-family: Georgia, serif;
  font-size: 16px;
  line-height: 1.8;
  white-space: pre-wrap;
  outline: none;
}
.wp-block-verse:empty::before {
  content: attr(data-placeholder);
  color: #949494;
}
</style>
