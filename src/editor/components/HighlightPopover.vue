<script setup>
import { ref, computed, watch } from 'vue'
import ColorPicker from './ColorPicker.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  textColor: { type: String, default: '' },
  backgroundColor: { type: String, default: '' },
})

const emit = defineEmits(['close', 'update:textColor', 'update:backgroundColor', 'clear'])

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

function handleClear() {
  emit('clear', activeTab.value)
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
  <div v-if="visible" class="highlight-popover" @click.stop @mousedown.stop>
    <!-- 返回按钮 -->
    <div v-if="showColorPicker" class="popover-header with-back">
      <button type="button" class="back-btn" @click="closeColorPicker">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
        </svg>
      </button>
      <span class="header-title">{{ activeTab === 'text' ? '文本颜色' : '背景颜色' }}</span>
    </div>

    <!-- 标签页 -->
    <div v-else class="popover-header">
      <button
        type="button"
        class="tab-btn"
        :class="{ 'is-active': activeTab === 'text' }"
        @click="setActiveTab('text')"
      >
        文本
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ 'is-active': activeTab === 'background' }"
        @click="setActiveTab('background')"
      >
        背景
      </button>
    </div>

    <div class="popover-body">
      <!-- 颜色选择器 -->
      <div v-if="showColorPicker" class="color-picker-view">
        <ColorPicker :model-value="currentColor" @update:model-value="handleColorPickerChange" />
      </div>

      <!-- 预设颜色 -->
      <div v-else class="preset-view">
        <div class="color-preview" @click="openColorPicker">
          <div class="preview-checker"></div>
          <div class="preview-color" :style="previewStyle"></div>
          <span v-if="!currentColor" class="preview-text">自定义颜色</span>
        </div>

        <div class="preset-colors">
          <button
            v-for="(color, index) in presetColors"
            :key="index"
            type="button"
            class="preset-color-btn"
            :class="{ 'is-active': currentColor === color }"
            :style="{ backgroundColor: color }"
            :title="color"
            @click="selectPresetColor(color)"
          >
            <span v-if="color === '#ffffff' || color === '#fafafa'" class="color-border"></span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="!showColorPicker" class="popover-footer">
      <button type="button" class="clear-btn" @click="handleClear">清空</button>
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
  width: 240px;
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

.popover-body {
  padding: 16px;
}

.color-preview {
  position: relative;
  width: 100%;
  height: 64px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 12px;
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
  bottom: 8px;
  left: 12px;
  font-size: 12px;
  color: #757575;
}

.preset-colors {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.preset-color-btn {
  position: relative;
  width: 28px;
  height: 28px;
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

.popover-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
  border-top: 1px solid #e0e0e0;
}

.clear-btn {
  padding: 4px 8px;
  border: none;
  background: none;
  font-size: 12px;
  color: #757575;
  cursor: pointer;
}

.clear-btn:hover {
  color: #1e1e1e;
}
</style>
