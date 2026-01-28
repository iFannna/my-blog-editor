<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

// 颜色格式
const colorFormat = ref('hex')

// HSV 值
const hue = ref(0)
const saturation = ref(100)
const brightness = ref(100)
const alpha = ref(100)

// 拖拽状态
const isDraggingPalette = ref(false)
const isDraggingHue = ref(false)
const isDraggingAlpha = ref(false)

const paletteRef = ref(null)
const hueSliderRef = ref(null)
const alphaSliderRef = ref(null)

// 计算当前颜色 RGBA
const currentRgba = computed(function () {
  return hsvToRgb(hue.value, saturation.value, brightness.value, alpha.value / 100)
})

// HSV 转 RGB
function hsvToRgb(h, s, v, a) {
  s = s / 100
  v = v / 100
  var c = v * s
  var x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  var m = v - c
  var r = 0,
    g = 0,
    b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else if (h >= 300 && h < 360) {
    r = c
    g = 0
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: a,
  }
}

// RGB 转 HSV
function rgbToHsv(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  var h = 0,
    s = 0,
    v = max
  var d = max - min
  s = max === 0 ? 0 : d / max

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / d + 2) * 60
        break
      case b:
        h = ((r - g) / d + 4) * 60
        break
    }
  }
  return { h: h, s: s * 100, v: v * 100 }
}

// RGBA 转 Hex
function rgbaToHex(r, g, b, a) {
  var hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  if (a < 1) {
    var alphaHex = Math.round(a * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase()
    hex += alphaHex
  }
  return hex
}

// RGB 转 HSL
function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  var h = 0,
    s = 0,
    l = (max + min) / 2
  if (max !== min) {
    var d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / d + 2) * 60
        break
      case b:
        h = ((r - g) / d + 4) * 60
        break
    }
  }
  return { h: h, s: s * 100, l: l * 100 }
}

// 显示值
const displayValue = computed(function () {
  var rgba = currentRgba.value
  if (colorFormat.value === 'hex') {
    return rgbaToHex(rgba.r, rgba.g, rgba.b, rgba.a)
  } else if (colorFormat.value === 'rgb') {
    if (rgba.a < 1) {
      return 'rgba(' + rgba.r + ', ' + rgba.g + ', ' + rgba.b + ', ' + rgba.a.toFixed(2) + ')'
    }
    return 'rgb(' + rgba.r + ', ' + rgba.g + ', ' + rgba.b + ')'
  } else if (colorFormat.value === 'hsl') {
    var hsl = rgbToHsl(rgba.r, rgba.g, rgba.b)
    if (alpha.value < 100) {
      return (
        'hsla(' +
        Math.round(hsl.h) +
        ', ' +
        Math.round(hsl.s) +
        '%, ' +
        Math.round(hsl.l) +
        '%, ' +
        (alpha.value / 100).toFixed(2) +
        ')'
      )
    }
    return 'hsl(' + Math.round(hsl.h) + ', ' + Math.round(hsl.s) + '%, ' + Math.round(hsl.l) + '%)'
  }
  return ''
})

// Hex 输入
const hexInput = computed({
  get: function () {
    var rgba = currentRgba.value
    return rgbaToHex(rgba.r, rgba.g, rgba.b, rgba.a).replace('#', '')
  },
  set: function (val) {
    parseHexInput(val)
  },
})

// 色板背景
const paletteBackground = computed(function () {
  return 'hsl(' + hue.value + ', 100%, 50%)'
})

// 透明度滑块背景
const alphaGradient = computed(function () {
  var rgba = currentRgba.value
  return (
    'linear-gradient(to right, rgba(' +
    rgba.r +
    ', ' +
    rgba.g +
    ', ' +
    rgba.b +
    ', 0), rgba(' +
    rgba.r +
    ', ' +
    rgba.g +
    ', ' +
    rgba.b +
    ', 1))'
  )
})

const formatOptions = ['Hex', 'HSL', 'RGB']

function cycleFormat() {
  var idx = formatOptions.findIndex(function (f) {
    return f.toLowerCase() === colorFormat.value
  })
  colorFormat.value = formatOptions[(idx + 1) % formatOptions.length].toLowerCase()
}

// 解析 Hex
function parseHexInput(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  if (hex.length >= 6) {
    var r = parseInt(hex.substr(0, 2), 16)
    var g = parseInt(hex.substr(2, 2), 16)
    var b = parseInt(hex.substr(4, 2), 16)
    var a = hex.length === 8 ? parseInt(hex.substr(6, 2), 16) / 255 : 1
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      var hsv = rgbToHsv(r, g, b)
      hue.value = hsv.h
      saturation.value = hsv.s
      brightness.value = hsv.v
      alpha.value = Math.round(a * 100)
    }
  }
}

// 解析颜色
function parseColor(colorStr) {
  if (!colorStr) return
  if (colorStr.startsWith('#')) {
    parseHexInput(colorStr)
    return
  }
  var rgbMatch = colorStr.match(
    /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/,
  )
  if (rgbMatch) {
    var r = parseInt(rgbMatch[1])
    var g = parseInt(rgbMatch[2])
    var b = parseInt(rgbMatch[3])
    var a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
    var hsv = rgbToHsv(r, g, b)
    hue.value = hsv.h
    saturation.value = hsv.s
    brightness.value = hsv.v
    alpha.value = Math.round(a * 100)
  }
}

// 色板拖拽
function handlePaletteMouseDown(e) {
  isDraggingPalette.value = true
  updatePaletteFromEvent(e)
  document.addEventListener('mousemove', handlePaletteMouseMove)
  document.addEventListener('mouseup', handlePaletteMouseUp)
}

function handlePaletteMouseMove(e) {
  if (isDraggingPalette.value) updatePaletteFromEvent(e)
}

function handlePaletteMouseUp() {
  isDraggingPalette.value = false
  document.removeEventListener('mousemove', handlePaletteMouseMove)
  document.removeEventListener('mouseup', handlePaletteMouseUp)
  emitValue()
}

function updatePaletteFromEvent(e) {
  if (!paletteRef.value) return
  var rect = paletteRef.value.getBoundingClientRect()
  var x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  var y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
  saturation.value = x * 100
  brightness.value = (1 - y) * 100
}

// Hue 滑块
function handleHueMouseDown(e) {
  isDraggingHue.value = true
  updateHueFromEvent(e)
  document.addEventListener('mousemove', handleHueMouseMove)
  document.addEventListener('mouseup', handleHueMouseUp)
}

function handleHueMouseMove(e) {
  if (isDraggingHue.value) updateHueFromEvent(e)
}

function handleHueMouseUp() {
  isDraggingHue.value = false
  document.removeEventListener('mousemove', handleHueMouseMove)
  document.removeEventListener('mouseup', handleHueMouseUp)
  emitValue()
}

function updateHueFromEvent(e) {
  if (!hueSliderRef.value) return
  var rect = hueSliderRef.value.getBoundingClientRect()
  hue.value = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360))
}

// Alpha 滑块
function handleAlphaMouseDown(e) {
  isDraggingAlpha.value = true
  updateAlphaFromEvent(e)
  document.addEventListener('mousemove', handleAlphaMouseMove)
  document.addEventListener('mouseup', handleAlphaMouseUp)
}

function handleAlphaMouseMove(e) {
  if (isDraggingAlpha.value) updateAlphaFromEvent(e)
}

function handleAlphaMouseUp() {
  isDraggingAlpha.value = false
  document.removeEventListener('mousemove', handleAlphaMouseMove)
  document.removeEventListener('mouseup', handleAlphaMouseUp)
  emitValue()
}

function updateAlphaFromEvent(e) {
  if (!alphaSliderRef.value) return
  var rect = alphaSliderRef.value.getBoundingClientRect()
  alpha.value = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)))
}

function emitValue() {
  emit('update:modelValue', displayValue.value)
}

function copyToClipboard() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(displayValue.value)
  }
}

watch(
  function () {
    return props.modelValue
  },
  function (val) {
    if (val) parseColor(val)
  },
  { immediate: true },
)
</script>

<template>
  <div class="color-picker">
    <!-- 色板 -->
    <div
      ref="paletteRef"
      class="color-palette"
      :style="{ backgroundColor: paletteBackground }"
      @mousedown="handlePaletteMouseDown"
    >
      <div class="palette-white"></div>
      <div class="palette-black"></div>
      <div
        class="palette-cursor"
        :style="{ left: saturation + '%', top: 100 - brightness + '%' }"
      ></div>
    </div>

    <!-- Hue 滑块 -->
    <div ref="hueSliderRef" class="hue-slider" @mousedown="handleHueMouseDown">
      <div class="slider-thumb" :style="{ left: (hue / 360) * 100 + '%' }"></div>
    </div>

    <!-- Alpha 滑块 -->
    <div ref="alphaSliderRef" class="alpha-slider" @mousedown="handleAlphaMouseDown">
      <div class="alpha-gradient" :style="{ background: alphaGradient }"></div>
      <div class="slider-thumb" :style="{ left: alpha + '%' }"></div>
    </div>

    <!-- 格式和输入 -->
    <div class="color-input-row">
      <button type="button" class="format-toggle" @click="cycleFormat">
        {{ colorFormat.charAt(0).toUpperCase() + colorFormat.slice(1) }}
        <svg viewBox="0 0 24 24" width="12" height="12">
          <path d="M7 10l5 5 5-5z" fill="currentColor" />
        </svg>
      </button>
      <button type="button" class="copy-btn" title="复制" @click="copyToClipboard">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path
            d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>

    <div class="color-value-input">
      <span v-if="colorFormat === 'hex'" class="input-prefix">#</span>
      <input
        v-if="colorFormat === 'hex'"
        type="text"
        class="hex-input"
        :value="hexInput"
        maxlength="8"
        @input="hexInput = $event.target.value"
        @blur="emitValue"
      />
      <span v-else class="color-value-text">{{ displayValue }}</span>
    </div>
  </div>
</template>

<style scoped>
.color-picker {
  width: 100%;
}

.color-palette {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 4px;
  cursor: crosshair;
  margin-bottom: 10px;
}

.palette-white {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #fff, transparent);
  border-radius: 4px;
}

.palette-black {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, #000);
  border-radius: 4px;
}

.palette-cursor {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.hue-slider {
  position: relative;
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(
    to right,
    #ff0000 0%,
    #ffff00 17%,
    #00ff00 33%,
    #00ffff 50%,
    #0000ff 67%,
    #ff00ff 83%,
    #ff0000 100%
  );
  cursor: pointer;
  margin-bottom: 8px;
}

.alpha-slider {
  position: relative;
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background-image:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0px;
  cursor: pointer;
  margin-bottom: 10px;
}

.alpha-gradient {
  position: absolute;
  inset: 0;
  border-radius: 5px;
}

.slider-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #fff;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.color-input-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.format-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border: none;
  background: none;
  font-size: 12px;
  color: #1e1e1e;
  cursor: pointer;
  border-radius: 4px;
}

.format-toggle:hover {
  background: #f0f0f0;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: none;
  color: #757575;
  cursor: pointer;
  border-radius: 4px;
}

.copy-btn:hover {
  background: #f0f0f0;
  color: #1e1e1e;
}

.color-value-input {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.input-prefix {
  color: #757575;
  margin-right: 2px;
}

.hex-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  text-transform: uppercase;
}

.color-value-text {
  color: #1e1e1e;
  font-size: 11px;
}
</style>
