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
    <div v-if="isSelected" class="block-editor-format-toolbar separator-toolbar">
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': style === 'default' }"
        title="默认"
        @click="style = 'default'"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M7 11h10v2H7z" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': style === 'wide' }"
        title="宽线"
        @click="style = 'wide'"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M4 11h16v2H4z" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': style === 'dots' }"
        title="点线"
        @click="style = 'dots'"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <circle cx="6" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="18" cy="12" r="1.5" fill="currentColor" />
        </svg>
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
  margin-bottom: 12px;
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
