<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

function handleClose() {
  emit('close')
}

function handleOverlayClick(e) {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">键盘快捷键</h2>
          <button type="button" class="modal-close" @click="handleClose">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- 显示快捷键帮助 -->
          <div class="shortcut-row">
            <span class="shortcut-label">显示这些键盘快捷键。</span>
            <span class="shortcut-keys">
              <kbd>Shift</kbd><span class="key-plus">+</span><kbd>Alt</kbd
              ><span class="key-plus">+</span><kbd>H</kbd>
            </span>
          </div>

          <!-- 全局快捷方式 -->
          <h3 class="shortcut-section-title">全局快捷方式</h3>

          <div class="shortcut-row">
            <span class="shortcut-label">在可视化编辑器和代码编辑器之间切换。</span>
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>Shift</kbd
              ><span class="key-plus">+</span><kbd>Alt</kbd><span class="key-plus">+</span
              ><kbd>M</kbd>
            </span>
          </div>

          <div class="shortcut-row">
            <span class="shortcut-label">保存你的更改。</span>
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>S</kbd>
            </span>
          </div>

          <div class="shortcut-row">
            <span class="shortcut-label">撤销你刚才的更改。</span>
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>Z</kbd>
            </span>
          </div>

          <div class="shortcut-row">
            <span class="shortcut-label">重新做上次撤销。</span>
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>Shift</kbd
              ><span class="key-plus">+</span><kbd>Z</kbd>
            </span>
          </div>

          <div class="shortcut-row">
            <span class="shortcut-label"></span>
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>Y</kbd>
            </span>
          </div>

          <!-- 方块快捷方式 -->
          <h3 class="shortcut-section-title">方块快捷方式</h3>

          <div class="shortcut-row">
            <span class="shortcut-label">复制选中的方块。</span>
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>C</kbd>
            </span>
          </div>

          <div class="shortcut-row">
            <span class="shortcut-label">切割选定的方块。</span>
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>X</kbd>
            </span>
          </div>

          <div class="shortcut-row">
            <span class="shortcut-label">粘贴选中的方块。</span>
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>V</kbd>
            </span>
          </div>

          <div class="shortcut-row">
            <span class="shortcut-label">删除选择。</span>
            <span class="shortcut-keys">
              <kbd>del</kbd>
            </span>
          </div>

          <div class="shortcut-row">
            <span class="shortcut-label"></span>
            <span class="shortcut-keys">
              <kbd>backspace</kbd>
            </span>
          </div>

          <!-- 文本格式化 -->
          <h3 class="shortcut-section-title">文本格式化</h3>

          <div class="shortcut-row">
            <span class="shortcut-label">将所选文本加粗。</span>
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>B</kbd>
            </span>
          </div>

          <div class="shortcut-row">
            <span class="shortcut-label">将所选文本标记为斜体。</span>
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>I</kbd>
            </span>
          </div>

          <div class="shortcut-row">
            <span class="shortcut-label">将选中的文本转换为链接。</span>
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>K</kbd>
            </span>
          </div>

          <div class="shortcut-row">
            <span class="shortcut-label">删除链接。</span>
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>Shift</kbd
              ><span class="key-plus">+</span><kbd>K</kbd>
            </span>
          </div>

          <div class="shortcut-row">
            <span class="shortcut-label">在所选文本下划线。</span>
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="key-plus">+</span><kbd>U</kbd>
            </span>
          </div>

          <div class="shortcut-row">
            <span class="shortcut-label">将选定的文本做成内联代码。</span>
            <span class="shortcut-keys">
              <kbd>Shift</kbd><span class="key-plus">+</span><kbd>Alt</kbd
              ><span class="key-plus">+</span><kbd>X</kbd>
            </span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-container {
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e1e1e;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  cursor: pointer;
  color: #757575;
  border-radius: 4px;
}

.modal-close:hover {
  background: #f0f0f0;
  color: #1e1e1e;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px 24px;
}

.shortcut-section-title {
  margin: 24px 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1e1e1e;
}

.shortcut-section-title:first-child {
  margin-top: 8px;
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.shortcut-row:last-child {
  border-bottom: none;
}

.shortcut-label {
  font-size: 14px;
  color: #1e1e1e;
}

.shortcut-keys {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.key-plus {
  color: #757575;
  font-size: 12px;
}

kbd {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  font-family: inherit;
  color: #1e1e1e;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
