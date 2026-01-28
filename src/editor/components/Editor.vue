<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../store.js'
import { serialize } from '../../blocks/index.js'
import EditorHeader from './EditorHeader.vue'
import LeftSidebar from './LeftSidebar.vue'
import RightSidebar from './RightSidebar.vue'
import BlockWrapper from './BlockWrapper.vue'
import BlockInserter from './BlockInserter.vue'
import BlockDropZone from './BlockDropZone.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'publish'])

const store = useEditorStore()
const editorContentRef = ref(null)

// 侧边栏显示状态
const leftSidebarVisible = ref(true)
const rightSidebarVisible = ref(true)

const blocks = computed(function () {
  return store.blocks
})

const isEmpty = computed(function () {
  return store.isEmpty
})

const isDragging = computed(function () {
  return store.isDragging
})

// 监听块变化，输出序列化内容
watch(
  blocks,
  function (newBlocks) {
    var html = serialize(newBlocks)
    emit('update:modelValue', html)
  },
  { deep: true },
)

function toggleLeftSidebar() {
  leftSidebarVisible.value = !leftSidebarVisible.value
}

function toggleRightSidebar() {
  rightSidebarVisible.value = !rightSidebarVisible.value
}

function handleClickBlank() {
  store.clearSelection()
}

function handleSave() {
  emit('save')
}

function handlePublish() {
  emit('publish')
}

function handleCanvasDragOver(e) {
  e.preventDefault()
}

function handleCanvasDrop(e) {
  var blockType = e.dataTransfer.getData('application/x-block-type')
  if (blockType) {
    e.preventDefault()
    store.insertBlock(blockType)
    store.stopDragging()
  }
}

function handleGlobalDragEnd() {
  setTimeout(function () {
    if (store.isDragging) {
      store.stopDragging()
    }
  }, 0)
}

// ========== 画布级别的粘贴处理 ==========

function isEditingText() {
  var activeElement = document.activeElement
  if (!activeElement) return false

  if (activeElement.isContentEditable) {
    return true
  }

  if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
    return true
  }

  return false
}

function handleCanvasPaste(e) {
  // 如果正在编辑文本，不拦截
  if (isEditingText()) {
    return
  }

  // 获取剪贴板数据
  var clipboardData = e.clipboardData || window.clipboardData
  if (!clipboardData) {
    return
  }

  var text = clipboardData.getData('text/plain')
  if (!text) {
    return
  }

  // 解析 WordPress 块格式
  var blockData = store.parseBlockHtml(text)
  if (blockData) {
    // 阻止默认粘贴行为
    e.preventDefault()
    e.stopPropagation()

    // 确定插入位置
    var insertIndex = store.blocks.length
    if (store.selectedBlockId) {
      var selectedIndex = store.getBlockIndex(store.selectedBlockId)
      if (selectedIndex !== -1) {
        insertIndex = selectedIndex + 1
      }
    }
    store.insertBlockAt(blockData.name, blockData.attributes, insertIndex)
  }
}

function handleCanvasKeyDown(e) {
  var isMod = e.metaKey || e.ctrlKey

  // Ctrl+Z 撤销
  if (isMod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
    if (!isEditingText()) {
      e.preventDefault()
      store.undo()
    }
    return
  }

  // Ctrl+Shift+Z 或 Ctrl+Y 重做
  if (
    (isMod && e.shiftKey && e.key.toLowerCase() === 'z') ||
    (isMod && e.key.toLowerCase() === 'y')
  ) {
    if (!isEditingText()) {
      e.preventDefault()
      store.redo()
    }
    return
  }
}

onMounted(function () {
  // 初始化时添加一个空段落块
  if (store.blocks.length === 0) {
    store.insertBlock('core/paragraph')
  }

  // 初始化历史记录
  store.initHistory()

  document.addEventListener('dragend', handleGlobalDragEnd)
  document.addEventListener('drop', handleGlobalDragEnd)

  // 添加画布级别的粘贴和键盘事件监听
  document.addEventListener('paste', handleCanvasPaste)
  document.addEventListener('keydown', handleCanvasKeyDown)
})

onBeforeUnmount(function () {
  document.removeEventListener('dragend', handleGlobalDragEnd)
  document.removeEventListener('drop', handleGlobalDragEnd)
  document.removeEventListener('paste', handleCanvasPaste)
  document.removeEventListener('keydown', handleCanvasKeyDown)
})
</script>

<template>
  <div class="editor-layout">
    <!-- 顶部工具栏 -->
    <EditorHeader
      :left-sidebar-visible="leftSidebarVisible"
      :right-sidebar-visible="rightSidebarVisible"
      @toggle-left-sidebar="toggleLeftSidebar"
      @toggle-right-sidebar="toggleRightSidebar"
      @save="handleSave"
      @publish="handlePublish"
    />

    <!-- 主体区域 -->
    <div class="editor-body">
      <!-- 左侧边栏 -->
      <LeftSidebar :visible="leftSidebarVisible" />

      <!-- 编辑内容区 -->
      <div
        ref="editorContentRef"
        class="editor-content"
        @click="handleClickBlank"
        @dragover="handleCanvasDragOver"
        @drop="handleCanvasDrop"
      >
        <div class="editor-canvas">
          <!-- 标题输入 -->
          <div class="editor-title-wrapper">
            <input type="text" class="editor-title-input" placeholder="添加文章标题" />
          </div>

          <!-- 块列表 -->
          <div
            class="block-editor-block-list"
            :class="{
              'block-editor-block-list--empty': isEmpty,
              'is-dragging': isDragging,
            }"
          >
            <!-- 顶部放置区域 -->
            <BlockDropZone :index="0" />

            <BlockInserter v-if="isEmpty && !isDragging" :index="0" />

            <template v-for="(block, index) in blocks" :key="block.clientId">
              <BlockWrapper :block="block" :index="index" />

              <BlockDropZone :index="index + 1" />

              <BlockInserter v-if="!isDragging" :index="index + 1" />
            </template>
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <RightSidebar :visible="rightSidebarVisible" />
    </div>
  </div>
</template>

<style scoped>
.editor-title-wrapper {
  margin-bottom: 24px;
}

.editor-title-input {
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  font-size: 2.5em;
  font-weight: 600;
  line-height: 1.4;
  color: #1e1e1e;
  outline: none;
}

.editor-title-input::placeholder {
  color: #949494;
}
</style>
