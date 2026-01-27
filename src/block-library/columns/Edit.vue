<script setup>
import { computed } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import RichTextEditor from '../../editor/components/RichTextEditor.vue'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()

const columns = computed({
  get: function () {
    return props.attributes.columns || 2
  },
  set: function (val) {
    var newContent = content.value.slice()
    while (newContent.length < val) {
      newContent.push('')
    }
    emit('update:attributes', { columns: val, content: newContent.slice(0, val) })
    store.commitBlockChanges()
  },
})

const content = computed({
  get: function () {
    return props.attributes.content || ['', '']
  },
  set: function (val) {
    emit('update:attributes', { content: val })
  },
})

function updateColumnContent(index, value) {
  var newContent = content.value.slice()
  newContent[index] = value
  content.value = newContent
}

function handleChangeComplete() {
  store.commitBlockChanges()
}
</script>

<template>
  <div class="wp-block-columns-wrapper">
    <div v-if="isSelected" class="columns-toolbar">
      <span>列数：</span>
      <select v-model.number="columns">
        <option :value="2">2</option>
        <option :value="3">3</option>
        <option :value="4">4</option>
      </select>
    </div>

    <div class="wp-block-columns" :style="{ gridTemplateColumns: 'repeat(' + columns + ', 1fr)' }">
      <div v-for="(col, index) in columns" :key="index" class="wp-block-column">
        <RichTextEditor
          :model-value="content[index] || ''"
          tag="p"
          :placeholder="'列 ' + (index + 1) + ' 内容'"
          @update:model-value="updateColumnContent(index, $event)"
          @change-complete="handleChangeComplete"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.columns-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}
.columns-toolbar select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.wp-block-columns {
  display: grid;
  gap: 16px;
}
.wp-block-column {
  padding: 16px;
  background: #f9f9f9;
  border: 1px dashed #ddd;
  border-radius: 4px;
  min-height: 100px;
}
.wp-block-column :deep(p) {
  margin: 0;
}
</style>
