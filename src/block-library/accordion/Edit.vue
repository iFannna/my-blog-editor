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

const items = computed({
  get: function () {
    return props.attributes.items || [{ title: '标题', content: '内容' }]
  },
  set: function (val) {
    emit('update:attributes', { items: val })
  },
})

function updateItem(index, field, value) {
  var newItems = JSON.parse(JSON.stringify(items.value))
  newItems[index][field] = value
  items.value = newItems
  store.commitBlockChanges()
}

function addItem() {
  var newItems = JSON.parse(JSON.stringify(items.value))
  newItems.push({ title: '新标题', content: '' })
  items.value = newItems
  store.commitBlockChanges()
}

function removeItem(index) {
  if (items.value.length <= 1) return
  var newItems = JSON.parse(JSON.stringify(items.value))
  newItems.splice(index, 1)
  items.value = newItems
  store.commitBlockChanges()
}
</script>

<template>
  <div class="wp-block-accordion">
    <details v-for="(item, index) in items" :key="index" class="accordion-item" open>
      <summary>
        <span
          contenteditable="true"
          @blur="updateItem(index, 'title', $event.target.textContent)"
          >{{ item.title }}</span
        >
        <button
          v-if="isSelected && items.length > 1"
          type="button"
          class="remove-btn"
          @click.prevent="removeItem(index)"
        >
          ×
        </button>
      </summary>
      <div class="accordion-content">
        <p
          contenteditable="true"
          data-placeholder="输入内容…"
          @blur="updateItem(index, 'content', $event.target.textContent)"
        >
          {{ item.content }}
        </p>
      </div>
    </details>

    <button v-if="isSelected" type="button" class="add-item-btn" @click="addItem">
      + 添加项目
    </button>
  </div>
</template>

<style scoped>
.wp-block-accordion {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}
.accordion-item {
  border-bottom: 1px solid #ddd;
}
.accordion-item:last-child {
  border-bottom: none;
}
.accordion-item summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9f9f9;
  cursor: pointer;
  font-weight: 500;
}
.accordion-item summary::-webkit-details-marker {
  display: none;
}
.accordion-item summary::before {
  content: '▶';
  font-size: 10px;
  margin-right: 8px;
  transition: transform 0.2s;
}
.accordion-item[open] summary::before {
  transform: rotate(90deg);
}
.accordion-item summary span {
  flex: 1;
  outline: none;
}
.remove-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
}
.remove-btn:hover {
  background: #cc1818;
  color: #fff;
}
.accordion-content {
  padding: 16px;
}
.accordion-content p {
  margin: 0;
  outline: none;
  min-height: 1.5em;
}
.accordion-content p:empty::before {
  content: attr(data-placeholder);
  color: #949494;
}
.add-item-btn {
  display: block;
  width: 100%;
  padding: 12px;
  border: none;
  border-top: 1px dashed #ddd;
  background: #fff;
  color: #007cba;
  cursor: pointer;
  font-size: 13px;
}
.add-item-btn:hover {
  background: #f0f0f0;
}
</style>
