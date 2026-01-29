<template>
  <!-- 无图片时：占位符 -->
  <div
    v-if="!url"
    class="wp-block-image"
    :class="{ 'has-illustration': !isSelected }"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <!-- 未选中时：简约占位符（带对角线插图） -->
    <template v-if="!isSelected">
      <svg
        class="placeholder-illustration"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 60 60"
        preserveAspectRatio="none"
      >
        <path vector-effect="non-scaling-stroke" d="M60 60 0 0" />
      </svg>
    </template>

    <!-- 选中时：完整交互占位符（使用你原有的样式） -->
    <template v-else>
      <div class="header">
        <span class="icon" v-html="imageIcon"></span>
        <span>图片</span>
      </div>
      <div class="tips">拖放图片、上传或从你的库中选择。</div>
      <div class="button-row">
        <button class="button" @click.stop="onUpload">上传</button>
        <button class="button" @click.stop="onMediaLibrary">媒体库</button>
        <button class="button" @click.stop="onInsertUrl">URL插入</button>
      </div>
    </template>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />
  </div>

  <!-- 有图片时：显示图片 -->
  <figure v-else class="wp-block-image">
    <img :src="url" :alt="alt" />
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import { getIcon } from '@/icons/index.js'

const props = defineProps({
  attributes: {
    type: Object,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()

const imageIcon = getIcon('image')
const fileInput = ref(null)

// 属性
const url = computed({
  get() {
    return props.attributes.url || ''
  },
  set(val) {
    emit('update:attributes', { url: val })
  },
})

const alt = computed({
  get() {
    return props.attributes.alt || ''
  },
  set(val) {
    emit('update:attributes', { alt: val })
  },
})

const caption = computed({
  get() {
    return props.attributes.caption || ''
  },
  set(val) {
    emit('update:attributes', { caption: val })
  },
})

// 上传按钮
function onUpload() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  var file = e.target.files && e.target.files[0]
  if (file) {
    var reader = new FileReader()
    reader.onload = function () {
      url.value = reader.result
      store.commitBlockChanges()
    }
    reader.readAsDataURL(file)
  }
  e.target.value = ''
}

// 媒体库按钮
function onMediaLibrary() {
  // 媒体库功能待实现
  alert('媒体库功能待实现')
}

// URL插入按钮
function onInsertUrl() {
  var inputUrl = prompt('请输入图片地址:')
  if (inputUrl) {
    url.value = inputUrl
    store.commitBlockChanges()
  }
}

// 拖拽上传
function handleDrop(e) {
  var files = e.dataTransfer.files
  if (files && files.length > 0) {
    var file = files[0]
    if (file.type.startsWith('image/')) {
      var reader = new FileReader()
      reader.onload = function () {
        url.value = reader.result
        store.commitBlockChanges()
      }
      reader.readAsDataURL(file)
    }
  }
}
</script>

<style scoped>
/* 未选中时的简约占位符样式 */
.wp-block-image.has-illustration {
  background-color: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  overflow: hidden;
}

/* 灰色背景遮罩 */
.wp-block-image.has-illustration::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  background: currentColor;
  opacity: 0.1;
  border-radius: 3px;
}

/* 对角线 SVG 插图 */
.placeholder-illustration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  stroke: currentColor;
  opacity: 0.25;
}
</style>
