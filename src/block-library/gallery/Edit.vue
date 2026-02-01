<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import { getIcon } from '@/icons/index.js'
import URLPopover from '../../editor/components/URLPopover.vue'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()

const galleryIcon = getIcon('gallery')
const fileInput = ref(null)
const showAddMenu = ref(false)
const urlButtonRef = ref(null)
const addButtonRef = ref(null)
const showURLPopover = ref(false)
const popoverAnchor = ref(null)

// 图片列表（最多9张）
const images = computed({
  get: function () {
    var imgs = props.attributes.images || []
    return imgs.slice(0, 9)
  },
  set: function (val) {
    emit('update:attributes', { images: val.slice(0, 9) })
  },
})

// 是否有图片
const hasImages = computed(function () {
  return images.value && images.value.length > 0
})

// 根据图片数量计算布局类名
const layoutClass = computed(function () {
  var count = images.value.length
  return 'layout-' + count
})

// 上传
function onUpload() {
  fileInput.value?.click()
  showAddMenu.value = false
}

// 处理文件选择
function handleFileChange(e) {
  var files = Array.from(e.target.files || [])
  if (files.length === 0) return

  var currentCount = images.value.length
  var maxToAdd = 9 - currentCount

  files.slice(0, maxToAdd).forEach(function (file) {
    if (!file.type.startsWith('image/')) return

    var reader = new FileReader()
    reader.onload = function () {
      var newImages = images.value.slice()
      if (newImages.length < 9) {
        newImages.push({
          url: reader.result,
          alt: '',
          id: Date.now() + Math.random(),
        })
        images.value = newImages
        store.commitBlockChanges()
      }
    }
    reader.readAsDataURL(file)
  })

  e.target.value = ''
}

// URL插入（占位符状态）
function onInsertUrlFromPlaceholder() {
  if (images.value.length >= 9) {
    alert('最多只能添加9张图片')
    return
  }
  popoverAnchor.value = urlButtonRef.value
  showURLPopover.value = true
}

// URL插入（下拉菜单）- 使用添加按钮作为锚点
function onInsertUrlFromMenu() {
  if (images.value.length >= 9) {
    alert('最多只能添加9张图片')
    return
  }
  // 使用工具栏的添加按钮作为锚点，因为菜单会关闭
  popoverAnchor.value = addButtonRef.value
  showAddMenu.value = false
  showURLPopover.value = true
}

function handleURLSubmit(url) {
  if (url) {
    var newImages = images.value.slice()
    newImages.push({
      url: url,
      alt: '',
      id: Date.now() + Math.random(),
    })
    images.value = newImages
    store.commitBlockChanges()
  }
}

function handleURLClose() {
  showURLPopover.value = false
}

// 媒体库
function onMediaLibrary() {
  showAddMenu.value = false
  alert('媒体库功能待实现')
}

// 拖拽上传
function handleDrop(e) {
  var files = Array.from(e.dataTransfer.files || [])
  var currentCount = images.value.length
  var maxToAdd = 9 - currentCount

  files.slice(0, maxToAdd).forEach(function (file) {
    if (!file.type.startsWith('image/')) return

    var reader = new FileReader()
    reader.onload = function () {
      var newImages = images.value.slice()
      if (newImages.length < 9) {
        newImages.push({
          url: reader.result,
          alt: '',
          id: Date.now() + Math.random(),
        })
        images.value = newImages
        store.commitBlockChanges()
      }
    }
    reader.readAsDataURL(file)
  })
}

// 删除图片
function removeImage(index) {
  var newImages = images.value.slice()
  newImages.splice(index, 1)
  images.value = newImages
  store.commitBlockChanges()
}

// 切换添加菜单
function toggleAddMenu(e) {
  e.stopPropagation()
  showAddMenu.value = !showAddMenu.value
}

// 点击外部关闭菜单
function handleClickOutside(e) {
  if (!e.target.closest('.add-menu-wrapper')) {
    showAddMenu.value = false
  }
}

onMounted(function () {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(function () {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  function () {
    return props.isSelected
  },
  function (selected) {
    if (!selected) {
      showURLPopover.value = false
      showAddMenu.value = false
    }
  },
)
</script>

<template>
  <!-- 无图片时：占位符 -->
  <div
    v-if="!hasImages"
    class="wp-block-gallery"
    :class="{ 'has-illustration': !isSelected }"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <!-- 未选中时：简约占位符 -->
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

    <!-- 选中时：完整交互占位符 -->
    <template v-else>
      <div class="header">
        <span class="icon" v-html="galleryIcon"></span>
        <span>画廊</span>
      </div>
      <div class="tips">拖放图片、上传或从你的库中选择。</div>
      <div class="button-row">
        <button class="button" @click.stop="onUpload">上传</button>
        <button class="button" @click.stop="onMediaLibrary">媒体库</button>
        <button ref="urlButtonRef" class="button" @click.stop="onInsertUrlFromPlaceholder">
          URL插入
        </button>
      </div>
    </template>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="handleFileChange"
    />

    <URLPopover
      v-model:visible="showURLPopover"
      :anchor-el="popoverAnchor"
      placeholder="粘贴或输入图片 URL"
      @submit="handleURLSubmit"
      @close="handleURLClose"
    />
  </div>

  <!-- 有图片时：显示画廊 -->
  <figure v-else class="wp-block-gallery has-images" :class="layoutClass">
    <!-- 工具栏 -->
    <div v-if="isSelected" class="block-editor-format-toolbar gallery-toolbar">
      <div class="add-menu-wrapper">
        <button
          ref="addButtonRef"
          type="button"
          class="format-button"
          :class="{ 'is-active': showAddMenu }"
          :disabled="images.length >= 9"
          title="添加图片"
          @click="toggleAddMenu"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M18 11h-5V6h-2v5H6v2h5v5h2v-5h5v-2z" fill="currentColor" />
          </svg>
        </button>

        <!-- 下拉菜单 -->
        <div v-show="showAddMenu" class="add-dropdown-menu" @click.stop>
          <button type="button" class="menu-item" @click="onUpload">
            <span class="menu-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M18.5 15v3.5H13V6.7l4.5 4.1 1-1.1-6.2-5.8-5.8 5.8 1 1.1 4-4v11.7h-6V15H4v5h16v-5z"
                ></path>
              </svg>
            </span>
            <span class="menu-label">上传</span>
          </button>

          <button type="button" class="menu-item" @click="onMediaLibrary">
            <span class="menu-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.5h14c.3 0 .5.2.5.5v8.4l-3-2.9c-.3-.3-.8-.3-1 0L11.9 14 9 12c-.3-.2-.6-.2-.8 0l-3.6 2.6V5c0-.3.2-.5.5-.5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span class="menu-label">媒体库</span>
          </button>

          <button type="button" class="menu-item" @click="onInsertUrlFromMenu">
            <span class="menu-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M15.6 7.2H14v1.5h1.6c2 0 3.7 1.7 3.7 3.7s-1.7 3.7-3.7 3.7H14v1.5h1.6c2.8 0 5.2-2.3 5.2-5.2 0-2.9-2.3-5.2-5.2-5.2zM4.7 12.4c0-2 1.7-3.7 3.7-3.7H10V7.2H8.4c-2.9 0-5.2 2.3-5.2 5.2s2.3 5.2 5.2 5.2H10v-1.5H8.4c-2-.1-3.7-1.7-3.7-3.7zm4.6.5h5.3v-1.5H9.3v1.5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span class="menu-label">URL插入</span>
          </button>
        </div>
      </div>

      <span v-if="images.length >= 9" class="toolbar-hint">已达上限</span>
    </div>

    <!-- 图片网格 -->
    <div class="gallery-grid">
      <div
        v-for="(img, index) in images"
        :key="img.id || index"
        class="gallery-item"
        :class="'item-' + index"
      >
        <img :src="img.url" :alt="img.alt || ''" />
        <button
          v-if="isSelected"
          type="button"
          class="remove-button"
          title="移除图片"
          @click="removeImage(index)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path
              d="M12 10.6L6.6 5.2 5.2 6.6l5.4 5.4-5.4 5.4 1.4 1.4 5.4-5.4 5.4 5.4 1.4-1.4-5.4-5.4 5.4-5.4-1.4-1.4-5.4 5.4z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="handleFileChange"
    />

    <URLPopover
      v-model:visible="showURLPopover"
      :anchor-el="popoverAnchor"
      placeholder="粘贴或输入图片 URL"
      @submit="handleURLSubmit"
      @close="handleURLClose"
    />
  </figure>
</template>

<style scoped>
/* ========== 占位符样式 ========== */
.wp-block-gallery:not(.has-images) {
  border: 1px solid #1e1e1e;
  border-radius: 2px;
  box-sizing: border-box;
  min-height: 150px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  position: relative;
}

.wp-block-gallery.has-illustration {
  border: none;
  background-color: transparent;
  padding: 0;
}

.wp-block-gallery.has-illustration::before {
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

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #434343;
  margin-bottom: 8px;
}

.header .icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.header .icon :deep(svg) {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.tips {
  color: #888;
  margin-bottom: 20px;
  font-size: 14px;
}

.button-row {
  display: flex;
  gap: 12px;
}

.button-row .button {
  font-size: 15px;
  padding: 7px 18px;
  border: 1.5px solid #3858e9;
  background: white;
  color: #3858e9;
  border-radius: 3px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  min-width: 72px;
}

.button-row .button:first-child {
  background: #3858e9;
  color: white;
}

.button-row .button:hover {
  background: #e9f2ff;
}

.button-row .button:first-child:hover {
  background: #2145e6;
}

/* ========== 画廊样式 ========== */
.wp-block-gallery.has-images {
  margin: 0;
}

/* 工具栏 */
.gallery-toolbar {
  margin-bottom: 12px;
}

.toolbar-hint {
  font-size: 12px;
  color: #757575;
  margin-left: 8px;
}

/* 添加菜单 */
.add-menu-wrapper {
  position: relative;
}

.add-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 140px;
  background: #fff;
  border: 1px solid #1e1e1e;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10000;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: #1e1e1e;
  text-align: left;
  gap: 10px;
}

.menu-item:hover {
  background-color: #f0f0f0;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.menu-icon svg {
  width: 24px;
  height: 24px;
}

.menu-label {
  flex: 1;
}

/* ========== 图片网格 ========== */
.gallery-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: flex-start;
}

.gallery-item {
  position: relative;
  border-radius: 2px;
  overflow: hidden;
}

.gallery-item img {
  display: block;
  width: 100%;
  height: auto;
}

/* 删除按钮 */
.remove-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.gallery-item:hover .remove-button {
  opacity: 1;
}

.remove-button:hover {
  background: rgba(0, 0, 0, 0.7);
}

/* ========== 不同图片数量的布局（保持比例） ========== */

/* 1张图片：全宽 */
.layout-1 .gallery-item {
  width: 100%;
}

/* 2张图片：并排各50% */
.layout-2 .gallery-item {
  width: calc(50% - 2px);
}

/* 3张图片：第一张50%，后两张各25%（或第一张大，后两张小） */
.layout-3 .gallery-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  align-items: start;
}
.layout-3 .item-0 {
  grid-row: 1 / 3;
}

/* 4张图片：2x2 */
.layout-4 .gallery-item {
  width: calc(50% - 2px);
}

/* 5张图片：上2下3 */
.layout-5 .gallery-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: start;
}
.layout-5 .item-0,
.layout-5 .item-1 {
  grid-column: span 3;
}
.layout-5 .item-2,
.layout-5 .item-3,
.layout-5 .item-4 {
  grid-column: span 2;
}

/* 6张图片：3x2 */
.layout-6 .gallery-item {
  width: calc(33.333% - 3px);
}

/* 7张图片：上4下3 */
.layout-7 .gallery-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  align-items: start;
}
.layout-7 .item-0,
.layout-7 .item-1,
.layout-7 .item-2,
.layout-7 .item-3 {
  grid-column: span 3;
}
.layout-7 .item-4,
.layout-7 .item-5,
.layout-7 .item-6 {
  grid-column: span 4;
}

/* 8张图片：4x2 */
.layout-8 .gallery-item {
  width: calc(25% - 3px);
}

/* 9张图片：3x3 */
.layout-9 .gallery-item {
  width: calc(33.333% - 3px);
}
</style>
