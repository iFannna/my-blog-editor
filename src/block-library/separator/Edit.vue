<script setup>
import { computed } from 'vue'
import { useEditorStore } from '../../editor/store.js'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()

const style = computed({
  get: function () {
    return props.attributes.style || 'default'
  },
  set: function (val) {
    emit('update:attributes', { style: val })
    store.commitBlockChanges()
  },
})
</script>

<template>
  <div class="separator-wrapper">
    <div v-if="isSelected" class="separator-toolbar">
      <button type="button" :class="{ active: style === 'default' }" @click="style = 'default'">
        默认
      </button>
      <button type="button" :class="{ active: style === 'wide' }" @click="style = 'wide'">
        宽线
      </button>
      <button type="button" :class="{ active: style === 'dots' }" @click="style = 'dots'">
        点线
      </button>
    </div>

    <hr class="wp-block-separator" :class="'is-style-' + style" />
  </div>
</template>

<style scoped>
.separator-wrapper {
  padding: 8px 0;
}
.separator-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.separator-toolbar button {
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
}
.separator-toolbar button.active {
  background: #1e1e1e;
  color: #fff;
  border-color: #1e1e1e;
}
.wp-block-separator {
  border: none;
  margin: 16px 0;
}
.wp-block-separator.is-style-default {
  border-top: 2px solid #1e1e1e;
  width: 100px;
  margin-left: auto;
  margin-right: auto;
}
.wp-block-separator.is-style-wide {
  border-top: 2px solid #1e1e1e;
  width: 100%;
}
.wp-block-separator.is-style-dots {
  border: none;
  text-align: center;
  height: auto;
}
.wp-block-separator.is-style-dots::before {
  content: '···';
  font-size: 24px;
  letter-spacing: 16px;
  color: #1e1e1e;
}
</style>
