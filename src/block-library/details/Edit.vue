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
const isOpen = ref(true)

const summary = computed({
  get: function () {
    return props.attributes.summary || '详细信息'
  },
  set: function (val) {
    emit('update:attributes', { summary: val })
  },
})

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

function toggleOpen() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="wp-block-details" :class="{ 'is-open': isOpen }">
    <div class="details-summary" @click="toggleOpen">
      <span class="details-marker">{{ isOpen ? '▼' : '▶' }}</span>
      <RichTextEditor
        v-model="summary"
        tag="span"
        class="summary-text"
        placeholder="摘要"
        @click.stop
        @change-complete="handleChangeComplete"
      />
    </div>
    <div v-if="isOpen" class="details-content">
      <RichTextEditor
        v-model="content"
        tag="p"
        placeholder="详细内容…"
        @change-complete="handleChangeComplete"
      />
    </div>
  </div>
</template>

<style scoped>
.wp-block-details {
  border: 0px !important;
}

.details-summary {
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  gap: 8px;
}

.details-marker {
  font-size: 10px;
  color: #404040;
}

.summary-text {
  flex: 1;
  font-weight: 500;
}

.details-content {
  padding: 8px 0 8px 18px;
  font-size: 500;
}

.details-content :deep(p) {
  margin: 0;
}
</style>
