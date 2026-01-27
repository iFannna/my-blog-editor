<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../store.js'
import { getIcon } from '../../icons/index.js'

const props = defineProps({
  leftSidebarVisible: {
    type: Boolean,
    default: true,
  },
  rightSidebarVisible: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['toggle-left-sidebar', 'toggle-right-sidebar', 'save', 'publish'])

const store = useEditorStore()

const canUndo = computed(function () {
  return store.canUndo
})

const canRedo = computed(function () {
  return store.canRedo
})

function toggleLeftSidebar() {
  emit('toggle-left-sidebar')
}

function toggleRightSidebar() {
  emit('toggle-right-sidebar')
}

function handleSave() {
  emit('save')
}

function handlePublish() {
  emit('publish')
}

function handleUndo() {
  store.undo()
}

function handleRedo() {
  store.redo()
}

// 键盘快捷键
function handleKeyDown(e) {
  var isMod = e.metaKey || e.ctrlKey

  if (isMod && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    if (e.shiftKey) {
      // Ctrl+Shift+Z = 重做
      handleRedo()
    } else {
      // Ctrl+Z = 撤销
      handleUndo()
    }
  }

  if (isMod && e.key.toLowerCase() === 'y') {
    // Ctrl+Y = 重做
    e.preventDefault()
    handleRedo()
  }

  if (isMod && e.key.toLowerCase() === 's') {
    // Ctrl+S = 保存
    e.preventDefault()
    handleSave()
  }
}

onMounted(function () {
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(function () {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <header class="editor-header">
    <!-- 左侧 -->
    <div class="editor-header-left">
      <!-- 切换左侧边栏 -->
      <button
        type="button"
        class="header-button"
        :class="{ 'is-active': leftSidebarVisible }"
        title="切换区块插入器"
        @click="toggleLeftSidebar"
      >
        <span v-html="getIcon('plus')"></span>
      </button>

      <div class="header-divider"></div>

      <!-- 撤销 -->
      <button
        type="button"
        class="header-button"
        title="撤销 (Ctrl+Z)"
        :disabled="!canUndo"
        @click="handleUndo"
      >
        <span v-html="getIcon('undo')"></span>
      </button>

      <!-- 重做 -->
      <button
        type="button"
        class="header-button"
        title="重做 (Ctrl+Shift+Z)"
        :disabled="!canRedo"
        @click="handleRedo"
      >
        <span v-html="getIcon('redo')"></span>
      </button>
    </div>

    <!-- 中间 -->
    <div class="editor-header-center">
      <!-- 可添加文档标题等 -->
    </div>

    <!-- 右侧 -->
    <div class="editor-header-right">
      <!-- 保存草稿 -->
      <button type="button" class="header-button" title="保存草稿 (Ctrl+S)" @click="handleSave">
        保存草稿
      </button>

      <!-- 发布按钮 -->
      <button type="button" class="header-button header-button-primary" @click="handlePublish">
        发布
      </button>

      <div class="header-divider"></div>

      <!-- 设置按钮 -->
      <button
        type="button"
        class="header-button"
        :class="{ 'is-active': rightSidebarVisible }"
        title="设置"
        @click="toggleRightSidebar"
      >
        <span v-html="getIcon('cog')"></span>
      </button>

      <!-- 更多选项 -->
      <button type="button" class="header-button" title="更多">
        <span v-html="getIcon('moreVertical')"></span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header-button:disabled {
  opacity: 0.3;
}

.header-button:disabled:hover {
  background: none;
}
</style>
