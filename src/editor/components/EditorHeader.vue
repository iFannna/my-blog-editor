<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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
  isCodeEditor: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'toggle-left-sidebar',
  'toggle-right-sidebar',
  'save',
  'publish',
  'toggle-code-editor',
  'show-shortcuts',
  'copy-all-blocks',
])

const store = useEditorStore()
const showMoreMenu = ref(false)

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

// 更多选项菜单
function toggleMoreMenu() {
  showMoreMenu.value = !showMoreMenu.value
}

function closeMoreMenu() {
  showMoreMenu.value = false
}

function handleVisualEditor() {
  if (props.isCodeEditor) {
    emit('toggle-code-editor')
  }
  closeMoreMenu()
}

function handleCodeEditor() {
  if (!props.isCodeEditor) {
    emit('toggle-code-editor')
  }
  closeMoreMenu()
}

function handleShowShortcuts() {
  emit('show-shortcuts')
  closeMoreMenu()
}

function handleCopyAllBlocks() {
  emit('copy-all-blocks')
  closeMoreMenu()
}

function handleHelp() {
  // 暂不实现
  closeMoreMenu()
}

function handleExit() {
  // 暂不实现
  closeMoreMenu()
}

// 点击外部关闭菜单
function handleClickOutside(e) {
  if (showMoreMenu.value && !e.target.closest('.more-menu-wrapper')) {
    closeMoreMenu()
  }
}

// 键盘快捷键
function handleKeyDown(e) {
  var isMod = e.metaKey || e.ctrlKey

  // Ctrl+Shift+Alt+M 切换代码编辑器
  if (isMod && e.shiftKey && e.altKey && e.key.toLowerCase() === 'm') {
    e.preventDefault()
    emit('toggle-code-editor')
    return
  }

  // Shift+Alt+H 显示快捷键帮助
  if (!isMod && e.shiftKey && e.altKey && e.key.toLowerCase() === 'h') {
    e.preventDefault()
    emit('show-shortcuts')
    return
  }

  // Ctrl+S 保存
  if (isMod && !e.shiftKey && e.key.toLowerCase() === 's') {
    e.preventDefault()
    handleSave()
    return
  }

  // Ctrl+Z 撤销
  if (isMod && !e.shiftKey && e.key.toLowerCase() === 'z') {
    // 如果在编辑器中，不拦截
    var activeElement = document.activeElement
    if (activeElement && activeElement.isContentEditable) return
    if (activeElement && activeElement.tagName === 'TEXTAREA') return
    e.preventDefault()
    handleUndo()
    return
  }

  // Ctrl+Shift+Z 或 Ctrl+Y 重做
  if (
    (isMod && e.shiftKey && e.key.toLowerCase() === 'z') ||
    (isMod && e.key.toLowerCase() === 'y')
  ) {
    var activeEl = document.activeElement
    if (activeEl && activeEl.isContentEditable) return
    if (activeEl && activeEl.tagName === 'TEXTAREA') return
    e.preventDefault()
    handleRedo()
  }
}

onMounted(function () {
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(function () {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="editor-header">
    <!-- 左侧 -->
    <div class="editor-header-left">
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

      <button
        type="button"
        class="header-button"
        title="撤销 (Ctrl+Z)"
        :disabled="!canUndo"
        @click="handleUndo"
      >
        <span v-html="getIcon('undo')"></span>
      </button>

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
    <div class="editor-header-center"></div>

    <!-- 右侧 -->
    <div class="editor-header-right">
      <button type="button" class="header-button" title="保存草稿 (Ctrl+S)" @click="handleSave">
        保存草稿
      </button>

      <button type="button" class="header-button header-button-primary" @click="handlePublish">
        发布
      </button>

      <div class="header-divider"></div>

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
      <div class="more-menu-wrapper">
        <button type="button" class="header-button" title="更多" @click.stop="toggleMoreMenu">
          <span v-html="getIcon('moreVertical')"></span>
        </button>

        <div v-if="showMoreMenu" class="more-menu-dropdown" @click.stop>
          <div class="menu-section-title">编辑</div>

          <button type="button" class="menu-item" @click="handleVisualEditor">
            <span class="menu-label">可视化编辑器</span>
            <span v-if="!isCodeEditor" class="menu-check">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
              </svg>
            </span>
          </button>

          <button type="button" class="menu-item" @click="handleCodeEditor">
            <span class="menu-label">代码编辑器</span>
            <span class="menu-shortcut">Ctrl+Shift+Alt+M</span>
            <span v-if="isCodeEditor" class="menu-check">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
              </svg>
            </span>
          </button>

          <div class="menu-divider"></div>
          <div class="menu-section-title">工具</div>

          <button type="button" class="menu-item" @click="handleShowShortcuts">
            <span class="menu-label">键盘快捷键</span>
            <span class="menu-shortcut">Shift+Alt+H</span>
          </button>

          <button type="button" class="menu-item" @click="handleCopyAllBlocks">
            <span class="menu-label">复制所有方块</span>
          </button>

          <button type="button" class="menu-item" @click="handleHelp">
            <span class="menu-label">帮助</span>
            <span class="menu-external">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  d="M18 19H6c-.6 0-1-.4-1-1V6c0-.6.4-1 1-1h5V3H6c-1.7 0-3 1.3-3 3v12c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3v-5h-2v5c0 .6-.4 1-1 1zM14 3v2h3.6l-9.3 9.3 1.4 1.4L19 6.4V10h2V3h-7z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </button>

          <div class="menu-divider"></div>

          <button type="button" class="menu-item" @click="handleExit">
            <span class="menu-label">退出</span>
          </button>
        </div>
      </div>
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

/* 更多选项菜单 */
.more-menu-wrapper {
  position: relative;
}

.more-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  min-width: 280px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  padding: 8px 0;
}

.menu-section-title {
  padding: 8px 16px 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  color: #757575;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: #1e1e1e;
  text-align: left;
}

.menu-item:hover {
  background-color: #f0f0f0;
}

.menu-label {
  flex: 1;
}

.menu-shortcut {
  font-size: 12px;
  color: #757575;
  margin-left: 16px;
}

.menu-check {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  color: #1e1e1e;
}

.menu-external {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  color: #757575;
}

.menu-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 8px 0;
}
</style>
