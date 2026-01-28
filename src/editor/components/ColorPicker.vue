<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const colorFormat = ref('hex')
const hue = ref(0)
const saturation = ref(100)
const brightness = ref(100)
const alpha = ref(100)

// RGB 输入值
const rgbR = ref(255)
const rgbG = ref(0)
const rgbB = ref(0)

// HSL 输入值
const hslH = ref(0)
const hslS = ref(100)
const hslL = ref(50)

const isDraggingPalette = ref(false)
const isDraggingHue = ref(false)
const isDraggingAlpha = ref(false)

const paletteRef = ref(null)
const hueSliderRef = ref(null)
const alphaSliderRef = ref(null)

const currentRgba = computed(function () {
  return hsvToRgb(hue.value, saturation.value, brightness.value, alpha.value / 100)
})

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

function hslToRgb(h, s, l) {
  s /= 100
  l /= 100
  var c = (1 - Math.abs(2 * l - 1)) * s
  var x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  var m = l - c / 2
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
  }
}

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

const hexInput = computed({
  get: function () {
    var rgba = currentRgba.value
    return rgbaToHex(rgba.r, rgba.g, rgba.b, rgba.a).replace('#', '')
  },
  set: function (val) {
    parseHexInput(val)
  },
})

const paletteBackground = computed(function () {
  return 'hsl(' + hue.value + ', 100%, 50%)'
})

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

const formatOptions = ['hex', 'rgb', 'hsl']

function cycleFormat() {
  var idx = formatOptions.indexOf(colorFormat.value)
  colorFormat.value = formatOptions[(idx + 1) % formatOptions.length]
  syncInputValues()
}

function syncInputValues() {
  var rgba = currentRgba.value
  rgbR.value = rgba.r
  rgbG.value = rgba.g
  rgbB.value = rgba.b

  var hsl = rgbToHsl(rgba.r, rgba.g, rgba.b)
  hslH.value = Math.round(hsl.h)
  hslS.value = Math.round(hsl.s)
  hslL.value = Math.round(hsl.l)
}

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
      syncInputValues()
    }
  }
}

function parseColor(colorStr) {
  if (!colorStr) return

  if (colorStr.startsWith('#')) {
    parseHexInput(colorStr)
    return
  }

  // 解析 rgb/rgba
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
    syncInputValues()
    return
  }

  // 解析 hsl/hsla
  var hslMatch = colorStr.match(
    /hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*([\d.]+))?\s*\)/,
  )
  if (hslMatch) {
    var h = parseInt(hslMatch[1])
    var s = parseInt(hslMatch[2])
    var l = parseInt(hslMatch[3])
    var aVal = hslMatch[4] ? parseFloat(hslMatch[4]) : 1
    var rgb = hslToRgb(h, s, l)
    var hsvVal = rgbToHsv(rgb.r, rgb.g, rgb.b)
    hue.value = hsvVal.h
    saturation.value = hsvVal.s
    brightness.value = hsvVal.v
    alpha.value = Math.round(aVal * 100)
    syncInputValues()
  }
}

// RGB 输入处理
function handleRgbInput() {
  var r = Math.max(0, Math.min(255, parseInt(rgbR.value) || 0))
  var g = Math.max(0, Math.min(255, parseInt(rgbG.value) || 0))
  var b = Math.max(0, Math.min(255, parseInt(rgbB.value) || 0))

  rgbR.value = r
  rgbG.value = g
  rgbB.value = b

  var hsv = rgbToHsv(r, g, b)
  hue.value = hsv.h
  saturation.value = hsv.s
  brightness.value = hsv.v

  emitValue()
}

// HSL 输入处理
function handleHslInput() {
  var h = Math.max(0, Math.min(360, parseInt(hslH.value) || 0))
  var s = Math.max(0, Math.min(100, parseInt(hslS.value) || 0))
  var l = Math.max(0, Math.min(100, parseInt(hslL.value) || 0))

  hslH.value = h
  hslS.value = s
  hslL.value = l

  var rgb = hslToRgb(h, s, l)
  var hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
  hue.value = hsv.h
  saturation.value = hsv.s
  brightness.value = hsv.v

  emitValue()
}

// Alpha 输入处理
function handleAlphaInput(e) {
  var val = parseFloat(e.target.value)
  if (!isNaN(val)) {
    alpha.value = Math.max(0, Math.min(100, Math.round(val * 100)))
    emitValue()
  }
}

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
}

function updatePaletteFromEvent(e) {
  if (!paletteRef.value) return
  var rect = paletteRef.value.getBoundingClientRect()
  var x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  var y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
  saturation.value = x * 100
  brightness.value = (1 - y) * 100
  syncInputValues()
  emitValue()
}

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
}

function updateHueFromEvent(e) {
  if (!hueSliderRef.value) return
  var rect = hueSliderRef.value.getBoundingClientRect()
  hue.value = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360))
  syncInputValues()
  emitValue()
}

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
}

function updateAlphaFromEvent(e) {
  if (!alphaSliderRef.value) return
  var rect = alphaSliderRef.value.getBoundingClientRect()
  alpha.value = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)))
  emitValue()
}

function emitValue() {
  emit('update:modelValue', displayValue.value)
}

function copyToClipboard() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(displayValue.value)
  }
}

function handleHexInputChange(e) {
  parseHexInput(e.target.value)
  emitValue()
}

watch(
  function () {
    return props.modelValue
  },
  function (val) {
    if (val) {
      parseColor(val)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="color-picker" @mousedown.stop>
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

    <!-- 格式切换和复制 -->
    <div class="color-input-row">
      <button type="button" class="format-toggle" @mousedown.prevent @click="cycleFormat">
        {{ colorFormat.toUpperCase() }}
        <svg viewBox="0 0 24 24" width="12" height="12">
          <path d="M7 10l5 5 5-5z" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        class="copy-btn"
        title="复制"
        @mousedown.prevent
        @click="copyToClipboard"
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path
            d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>

    <!-- HEX 输入 -->
    <div v-if="colorFormat === 'hex'" class="color-value-input">
      <span class="input-prefix">#</span>
      <input
        type="text"
        class="value-input hex-input"
        :value="hexInput"
        maxlength="8"
        @mousedown.stop
        @input="handleHexInputChange"
      />
    </div>

    <!-- RGB 输入 -->
    <div v-else-if="colorFormat === 'rgb'" class="color-value-input rgb-input">
      <div class="input-group">
        <label>R</label>
        <input
          type="number"
          class="value-input"
          v-model.number="rgbR"
          min="0"
          max="255"
          @mousedown.stop
          @change="handleRgbInput"
        />
      </div>
      <div class="input-group">
        <label>G</label>
        <input
          type="number"
          class="value-input"
          v-model.number="rgbG"
          min="0"
          max="255"
          @mousedown.stop
          @change="handleRgbInput"
        />
      </div>
      <div class="input-group">
        <label>B</label>
        <input
          type="number"
          class="value-input"
          v-model.number="rgbB"
          min="0"
          max="255"
          @mousedown.stop
          @change="handleRgbInput"
        />
      </div>
      <div class="input-group">
        <label>A</label>
        <input
          type="number"
          class="value-input"
          :value="(alpha / 100).toFixed(2)"
          min="0"
          max="1"
          step="0.01"
          @mousedown.stop
          @change="handleAlphaInput"
        />
      </div>
    </div>

    <!-- HSL 输入 -->
    <div v-else-if="colorFormat === 'hsl'" class="color-value-input hsl-input">
      <div class="input-group">
        <label>H</label>
        <input
          type="number"
          class="value-input"
          v-model.number="hslH"
          min="0"
          max="360"
          @mousedown.stop
          @change="handleHslInput"
        />
      </div>
      <div class="input-group">
        <label>S</label>
        <input
          type="number"
          class="value-input"
          v-model.number="hslS"
          min="0"
          max="100"
          @mousedown.stop
          @change="handleHslInput"
        />
      </div>
      <div class="input-group">
        <label>L</label>
        <input
          type="number"
          class="value-input"
          v-model.number="hslL"
          min="0"
          max="100"
          @mousedown.stop
          @change="handleHslInput"
        />
      </div>
      <div class="input-group">
        <label>A</label>
        <input
          type="number"
          class="value-input"
          :value="(alpha / 100).toFixed(2)"
          min="0"
          max="1"
          step="0.01"
          @mousedown.stop
          @change="handleAlphaInput"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-picker {
  width: 100%;
  user-select: none;
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
  height: 12px;
  border-radius: 6px;
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
  height: 12px;
  border-radius: 6px;
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
  border-radius: 6px;
}

.slider-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: #fff;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.color-input-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.format-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  background: #f0f0f0;
  font-size: 11px;
  font-weight: 500;
  color: #1e1e1e;
  cursor: pointer;
  border-radius: 4px;
}

.format-toggle:hover {
  background: #e0e0e0;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
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
  gap: 4px;
}

.color-value-input.rgb-input,
.color-value-input.hsl-input {
  padding: 8px;
  gap: 6px;
}

.input-prefix {
  color: #757575;
}

.value-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  background: transparent;
}

.hex-input {
  text-transform: uppercase;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.input-group label {
  font-size: 10px;
  color: #757575;
  margin-bottom: 2px;
}

.input-group .value-input {
  width: 100%;
  text-align: center;
  padding: 4px 2px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 11px;
  -moz-appearance: textfield;
}

.input-group .value-input::-webkit-outer-spin-button,
.input-group .value-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-group .value-input:focus {
  border-color: #007cba;
  outline: none;
}
</style>
