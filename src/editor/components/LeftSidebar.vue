<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../store.js'
import { getBlockTypes } from '../../blocks/index.js'
import { getIcon } from '../../icons/index.js'
import BlockPreview from './BlockPreview.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
})

const store = useEditorStore()
const searchQuery = ref('')

const hoveredBlock = ref(null)
const previewPosition = ref({ x: 0, y: 0 })
const showPreview = ref(false)
const previewTimeout = ref(null)

const blockTypes = computed(function () {
  return getBlockTypes()
})

const textBlocks = computed(function () {
  return blockTypes.value.filter(function (bt) {
    return bt.category === 'text'
  })
})

const mediaBlocks = computed(function () {
  return blockTypes.value.filter(function (bt) {
    return bt.category === 'media'
  })
})

const designBlocks = computed(function () {
  return blockTypes.value.filter(function (bt) {
    return bt.category === 'design'
  })
})

const filteredBlocks = computed(function () {
  if (!searchQuery.value) return null
  var query = searchQuery.value.toLowerCase()
  return blockTypes.value.filter(function (bt) {
    var matchTitle = bt.title.toLowerCase().indexOf(query) !== -1
    var matchKeywords =
      bt.keywords &&
      bt.keywords.some(function (k) {
        return k.toLowerCase().indexOf(query) !== -1
      })
    return matchTitle || matchKeywords
  })
})

function insertBlock(blockName) {
  store.insertBlock(blockName)
  hidePreview()
}

function renderIcon(iconName) {
  return getIcon(iconName)
}

// 预览
function handleMouseEnter(e, blockName) {
  if (previewTimeout.value) clearTimeout(previewTimeout.value)
  previewTimeout.value = setTimeout(function () {
    hoveredBlock.value = blockName
    updatePreviewPosition(e)
    showPreview.value = true
  }, 300)
}

function handleMouseMove(e) {
  if (showPreview.value) updatePreviewPosition(e)
}

function handleMouseLeave() {
  hidePreview()
}

function hidePreview() {
  if (previewTimeout.value) {
    clearTimeout(previewTimeout.value)
    previewTimeout.value = null
  }
  showPreview.value = false
  hoveredBlock.value = null
}

function updatePreviewPosition(e) {
  var sidebarWidth = 350
  var previewHeight = 400
  var padding = 16
  var x = sidebarWidth + padding
  var y = e.clientY - 50
  if (y + previewHeight > window.innerHeight - padding) {
    y = window.innerHeight - previewHeight - padding
  }
  if (y < padding) y = padding
  previewPosition.value = { x: x, y: y }
}

// 拖拽
function handleDragStart(e, blockName) {
  e.dataTransfer.effectAllowed = 'copy'
  e.dataTransfer.setData('text/plain', blockName)
  e.dataTransfer.setData('application/x-block-type', blockName)
  hidePreview()
}

function handleDragEnd() {
  store.stopDragging()
}

onMounted(function () {
  document.addEventListener('dragend', handleDragEnd)
})

onBeforeUnmount(function () {
  document.removeEventListener('dragend', handleDragEnd)
  if (previewTimeout.value) clearTimeout(previewTimeout.value)
})
</script>

<template>
  <aside class="editor-left-sidebar" :class="{ 'is-hidden': !visible }">
    <div class="sidebar-search">
      <input v-model="searchQuery" type="text" class="sidebar-search-input" placeholder="搜索" />
    </div>

    <div class="sidebar-content">
      <template v-if="filteredBlocks">
        <div class="sidebar-section">
          <h3 class="sidebar-section-title">搜索结果</h3>
          <div class="block-types-grid">
            <button
              v-for="bt in filteredBlocks"
              :key="bt.name"
              type="button"
              class="block-type-item"
              draggable="true"
              @click="insertBlock(bt.name)"
              @dragstart="handleDragStart($event, bt.name)"
              @mouseenter="handleMouseEnter($event, bt.name)"
              @mousemove="handleMouseMove"
              @mouseleave="handleMouseLeave"
            >
              <span class="block-type-icon" v-html="renderIcon(bt.iconName)"></span>
              <span class="block-type-label">{{ bt.title }}</span>
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-if="textBlocks.length" class="sidebar-section">
          <h3 class="sidebar-section-title">文字</h3>
          <div class="block-types-grid">
            <button
              v-for="bt in textBlocks"
              :key="bt.name"
              type="button"
              class="block-type-item"
              draggable="true"
              @click="insertBlock(bt.name)"
              @dragstart="handleDragStart($event, bt.name)"
              @mouseenter="handleMouseEnter($event, bt.name)"
              @mousemove="handleMouseMove"
              @mouseleave="handleMouseLeave"
            >
              <span class="block-type-icon" v-html="renderIcon(bt.iconName)"></span>
              <span class="block-type-label">{{ bt.title }}</span>
            </button>
          </div>
        </div>

        <div v-if="mediaBlocks.length" class="sidebar-section">
          <h3 class="sidebar-section-title">媒体</h3>
          <div class="block-types-grid">
            <button
              v-for="bt in mediaBlocks"
              :key="bt.name"
              type="button"
              class="block-type-item"
              draggable="true"
              @click="insertBlock(bt.name)"
              @dragstart="handleDragStart($event, bt.name)"
              @mouseenter="handleMouseEnter($event, bt.name)"
              @mousemove="handleMouseMove"
              @mouseleave="handleMouseLeave"
            >
              <span class="block-type-icon" v-html="renderIcon(bt.iconName)"></span>
              <span class="block-type-label">{{ bt.title }}</span>
            </button>
          </div>
        </div>

        <div v-if="designBlocks.length" class="sidebar-section">
          <h3 class="sidebar-section-title">设计</h3>
          <div class="block-types-grid">
            <button
              v-for="bt in designBlocks"
              :key="bt.name"
              type="button"
              class="block-type-item"
              draggable="true"
              @click="insertBlock(bt.name)"
              @dragstart="handleDragStart($event, bt.name)"
              @mouseenter="handleMouseEnter($event, bt.name)"
              @mousemove="handleMouseMove"
              @mouseleave="handleMouseLeave"
            >
              <span class="block-type-icon" v-html="renderIcon(bt.iconName)"></span>
              <span class="block-type-label">{{ bt.title }}</span>
            </button>
          </div>
        </div>
      </template>
    </div>

    <Teleport to="body">
      <BlockPreview
        v-if="showPreview && hoveredBlock"
        :block-name="hoveredBlock"
        :position="previewPosition"
      />
    </Teleport>
  </aside>
</template>

<style scoped>
.block-type-item {
  cursor: grab;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.block-type-item:hover {
  background: var(--color-gray-100);
  transform: scale(1.02);
}

.block-type-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}
</style>
