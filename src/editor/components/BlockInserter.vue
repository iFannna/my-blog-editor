<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../store.js'
import { getBlockTypes } from '../../blocks/index.js'
import { getIcon } from '../../icons/index.js'

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
})

const store = useEditorStore()
const isOpen = ref(false)

const blockTypes = computed(function () {
  return getBlockTypes()
})

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function insertBlock(blockName) {
  store.insertBlock(blockName, {}, props.index)
  isOpen.value = false
}

function handleClickOutside(e) {
  if (!e.target.closest('.block-editor-inserter')) {
    closeMenu()
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<template>
  <div class="block-editor-inserter" :class="{ 'is-open': isOpen }">
    <button type="button" class="inserter-toggle" title="添加区块" @click.stop="toggleMenu">
      <span v-html="getIcon('plus')"></span>
    </button>

    <div v-if="isOpen" class="block-editor-quick-inserter" @click.stop>
      <div class="quick-inserter-list">
        <button
          v-for="bt in blockTypes"
          :key="bt.name"
          type="button"
          class="quick-inserter-item"
          :title="bt.title"
          @click="insertBlock(bt.name)"
        >
          <span class="quick-inserter-icon" v-html="getIcon(bt.iconName)"></span>
          <span class="quick-inserter-label">{{ bt.title }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.block-editor-inserter {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 8px 0;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.block-editor-inserter:hover,
.block-editor-inserter:focus-within,
.block-editor-inserter.is-open {
  opacity: 1;
}

.inserter-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: none;
  color: #1e1e1e;
  cursor: pointer;
  transition: all 0.15s ease;
}

.inserter-toggle:hover {
  background: #f0f0f0;
  color: #007cba;
}

.inserter-toggle :deep(svg) {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

/* 快速插入器面板 */
.block-editor-quick-inserter {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  padding: 8px;
  margin-top: 4px;
}

.quick-inserter-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 0;
}

.quick-inserter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 70px;
  padding: 8px 4px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: none;
  color: #1e1e1e;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.1s ease;
  gap: 6px;
}

.quick-inserter-item:hover {
  background: #f0f0f0;
  border-color: #ddd;
}

.quick-inserter-item:active {
  background: #e0e0e0;
}

.quick-inserter-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}

.quick-inserter-icon :deep(svg) {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.quick-inserter-item:hover .quick-inserter-icon {
  border-color: #007cba;
  color: #007cba;
}

.quick-inserter-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.2;
}
</style>
