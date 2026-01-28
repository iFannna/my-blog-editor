<script setup>
/**
 * 高亮颜色 UI - 移植自 Gutenberg format-library/src/text-color/inline.js
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { setColors, getActiveColors } from '../../rich-text/index.js'
import ColorPicker from './ColorPicker.vue'

const props = defineProps({
  // 当前的 RichText record 对象
  value: {
    type: Object,
    required: true,
  },
  // 弹窗是否可见
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['change', 'close'])

const activeTab = ref('color') // 'color' 或 'backgroundColor'
const showCustomPicker = ref(false)

// 预设颜色
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

// 获取当前激活的颜色
const activeColors = computed(function () {
  return getActiveColors(props.value)
})

const currentColor = computed(function () {
  return activeColors.value[activeTab.value] || ''
})

const previewStyle = computed(function () {
  return currentColor.value ? { backgroundColor: currentColor.value } : {}
})

// 设置颜色
function handleColorChange(color) {
  var colors = {}
  colors[activeTab.value] = color

  // 调用 setColors 获取新的 record
  var newRecord = setColors(props.value, colors)

  // 发送变更事件
  emit('change', newRecord)
}

// 选择预设颜色
function selectPresetColor(color) {
  handleColorChange(color)
}

// 自定义颜色变更
function handleCustomColorChange(color) {
  handleColorChange(color)
}

// 清除颜色
function handleClear() {
  handleColorChange(undefined)
}

// 切换标签
function setActiveTab(tab) {
  activeTab.value = tab
  showCustomPicker.value = false
}

// 打开自定义颜色选择器
function openCustomPicker() {
  showCustomPicker.value = true
}

// 关闭自定义颜色选择器
function closeCustomPicker() {
  showCustomPicker.value = false
}

// 点击外部关闭
function handleClickOutside(e) {
  if (props.visible && !e.target.closest('.inline-color-ui')) {
    emit('close')
  }
}

watch(
  function () {
    return props.visible
  },
  function (val) {
    if (!val) {
      showCustomPicker.value = false
    }
  },
)

onMounted(function () {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(function () {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div v-if="visible" class="inline-color-ui" @mousedown.stop>
    <!-- 返回按钮 -->
    <div v-if="showCustomPicker" class="color-ui-header with-back">
      <button type="button" class="back-btn" @click="closeCustomPicker">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
        </svg>
      </button>
      <span class="header-title">{{ activeTab === 'color' ? '文本颜色' : '背景颜色' }}</span>
    </div>

    <!-- 标签页 -->
    <div v-else class="color-ui-header">
      <button
        type="button"
        class="tab-btn"
        :class="{ 'is-active': activeTab === 'color' }"
        @click="setActiveTab('color')"
      >
        文本
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ 'is-active': activeTab === 'backgroundColor' }"
        @click="setActiveTab('backgroundColor')"
      >
        背景
      </button>
    </div>

    <div class="color-ui-body">
      <!-- 自定义颜色选择器 -->
      <div v-if="showCustomPicker" class="custom-picker-view">
        <ColorPicker :model-value="currentColor" @update:model-value="handleCustomColorChange" />
      </div>

      <!-- 预设颜色 -->
      <div v-else class="preset-view">
        <!-- 颜色预览 -->
        <div class="color-preview" @click="openCustomPicker">
          <div class="preview-checker"></div>
          <div class="preview-color" :style="previewStyle"></div>
          <span v-if="!currentColor" class="preview-text">自定义颜色</span>
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
            @click="selectPresetColor(color)"
          >
            <span v-if="color === '#ffffff' || color === '#fafafa'" class="color-border"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div v-if="!showCustomPicker" class="color-ui-footer">
      <button type="button" class="clear-btn" @click="handleClear">清空</button>
    </div>
  </div>
</template>

<style scoped>
.inline-color-ui {
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

.color-ui-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.color-ui-header.with-back {
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

.color-ui-body {
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

.color-ui-footer {
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
