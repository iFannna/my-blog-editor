<script setup>
import { ref, computed, watch } from 'vue'
import ColorPicker from './ColorPicker.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  textColor: { type: String, default: '' },
  backgroundColor: { type: String, default: '' },
})

const emit = defineEmits([
  'close',
  'update:textColor',
  'update:backgroundColor',
  'apply',
  'clear',
  'clear-type',
])

const activeTab = ref('text')
const showColorPicker = ref(false)

const presetColors = [
  '#3858e9',
  '#2563eb',
  '#1e1e1e',
  '#ffffff',
  '#f8f8f8',
  '#000000',
  '#94a3b8',
  '#fafafa',
  '#fca5a5',
  '#b91c1c',
  '#ea580c',
  '#facc15',
  '#22c55e',
  '#2dd4bf',
  '#38bdf8',
  '#3b82f6',
  '#8b5cf6',
  '#d946ef',
]

const currentColor = computed(function () {
  return activeTab.value === 'text' ? props.textColor : props.backgroundColor
})

const previewStyle = computed(function () {
  return currentColor.value ? { backgroundColor: currentColor.value } : {}
})

const hasAnyColor = computed(function () {
  return !!props.textColor || !!props.backgroundColor
})

// 显示当前标签页有颜色
const currentTabHasColor = computed(function () {
  return !!currentColor.value
})

function setActiveTab(tab) {
  activeTab.value = tab
  showColorPicker.value = false
}

function selectPresetColor(color) {
  if (activeTab.value === 'text') {
    emit('update:textColor', color)
  } else {
    emit('update:backgroundColor', color)
  }
}

function openColorPicker() {
  showColorPicker.value = true
}

function closeColorPicker() {
  showColorPicker.value = false
}

function handleColorPickerChange(color) {
  if (activeTab.value === 'text') {
    emit('update:textColor', color)
  } else {
    emit('update:backgroundColor', color)
  }
}

function handleApply() {
  emit('apply')
}

function handleClearAll() {
  emit('clear')
}

// 清除当前标签页的颜色
function handleClearCurrentColor() {
  emit('clear-type', activeTab.value)
}

watch(
  function () {
    return props.visible
  },
  function (val) {
    if (!val) {
      showColorPicker.value = false
      activeTab.value = 'text'
    }
  },
)
</script>

<template>
  <div v-if="visible" class="highlight-popover" @mousedown.prevent.stop @click.stop>
    <!-- 返回按钮（颜色选择器模式） -->
    <div v-if="showColorPicker" class="popover-header with-back">
      <button type="button" class="back-btn" @mousedown.prevent @click="closeColorPicker">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
        </svg>
      </button>
      <span class="header-title">{{ activeTab === 'text' ? '文本颜色' : '背景颜色' }}</span>
    </div>

    <!-- 标签页头部 -->
    <div v-else class="popover-header">
      <button
        type="button"
        class="tab-btn"
        :class="{ 'is-active': activeTab === 'text' }"
        @mousedown.prevent
        @click="setActiveTab('text')"
      >
        文本
        <span v-if="textColor" class="tab-color-dot" :style="{ backgroundColor: textColor }"></span>
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ 'is-active': activeTab === 'background' }"
        @mousedown.prevent
        @click="setActiveTab('background')"
      >
        背景
        <span
          v-if="backgroundColor"
          class="tab-color-dot"
          :style="{ backgroundColor: backgroundColor }"
        ></span>
      </button>
    </div>

    <div class="popover-body">
      <!-- 颜色选择器视图 -->
      <div v-if="showColorPicker" class="color-picker-view">
        <ColorPicker :model-value="currentColor" @update:model-value="handleColorPickerChange" />
      </div>

      <!-- 预设颜色视图 -->
      <div v-else class="preset-view">
        <!-- 颜色预览（点击打开自定义颜色选择器） -->
        <div class="color-preview-row">
          <div class="color-preview" @mousedown.prevent @click="openColorPicker">
            <div class="preview-checker"></div>
            <div class="preview-color" :style="previewStyle"></div>
            <span v-if="!currentColor" class="preview-text">自定义颜色</span>
            <span v-else class="preview-value">{{ currentColor }}</span>
          </div>
          <!-- 清除当前颜色按钮 -->
          <button
            v-if="currentTabHasColor"
            type="button"
            class="clear-current-btn"
            title="清除此颜色"
            @mousedown.prevent
            @click="handleClearCurrentColor"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <!-- 预设颜色网格 -->
        <div class="preset-colors">
          <button
            v-for="(color, index) in presetColors"
            :key="index"
            type="button"
            class="preset-color-btn"
            :class="{ 'is-active': currentColor === color }"
            :style="{ backgroundColor: color }"
            :title="color"
            @mousedown.prevent
            @click="selectPresetColor(color)"
          >
            <span v-if="color === '#ffffff' || color === '#fafafa'" class="color-border"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="popover-footer">
      <button type="button" class="clear-btn" @mousedown.prevent @click="handleClearAll">
        全部清除
      </button>
      <button
        type="button"
        class="apply-btn"
        :disabled="!hasAnyColor"
        @mousedown.prevent
        @click="handleApply"
      >
        应用
      </button>
    </div>
  </div>
</template>

<style scoped>
.highlight-popover {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  width: 260px;
  background: #fff;
  border: 1px solid #1e1e1e;
  border-radius: 2px;
  margin-top: 8px;
}

.popover-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.popover-header.with-back {
  gap: 8px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: none;
  color: #1e1e1e;
  cursor: pointer;
  border-radius: 4px;
}

.back-btn:hover {
  background: #f0f0f0;
}

.header-title {
  font-size: 13px;
  font-weight: 500;
  color: #1e1e1e;
}

.tab-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: none;
  font-size: 13px;
  color: #757575;
  cursor: pointer;
}

.tab-btn:hover {
  color: #1e1e1e;
}

.tab-btn.is-active {
  color: #007cba;
}

.tab-btn.is-active::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  right: 0;
  height: 2px;
  background: #007cba;
}

.tab-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.popover-body {
  padding: 16px;
}

.color-preview-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.color-preview {
  flex: 1;
  position: relative;
  height: 48px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
}

.preview-checker {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
    linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
  background-size: 12px 12px;
  background-position:
    0 0,
    0 6px,
    6px -6px,
    -6px 0px;
}

.preview-color {
  position: absolute;
  inset: 0;
}

.preview-text {
  position: absolute;
  bottom: 6px;
  left: 10px;
  font-size: 12px;
  color: #757575;
}

.preview-value {
  position: absolute;
  bottom: 6px;
  left: 10px;
  font-size: 11px;
  font-family: monospace;
  color: #1e1e1e;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 2px;
}

.clear-current-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  color: #757575;
  cursor: pointer;
}

.clear-current-btn:hover {
  background: #f5f5f5;
  color: #cc1818;
  border-color: #cc1818;
}

.preset-colors {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.preset-color-btn {
  position: relative;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.preset-color-btn:hover {
  transform: scale(1.1);
}

.preset-color-btn.is-active {
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 3px #007cba;
}

.preset-color-btn .color-border {
  position: absolute;
  inset: 0;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
}

.color-picker-view {
  min-height: 200px;
}

.popover-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  gap: 8px;
}

.clear-btn {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  background: #fff;
  font-size: 13px;
  color: #757575;
  cursor: pointer;
  border-radius: 4px;
}

.clear-btn:hover {
  background: #f5f5f5;
  color: #1e1e1e;
}

.apply-btn {
  padding: 8px 20px;
  border: none;
  background: #007cba;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
}

.apply-btn:hover:not(:disabled) {
  background: #006ba1;
}

.apply-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
