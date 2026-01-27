<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getIcon } from '../../icons/index.js'

const props = defineProps({
  editorRef: {
    type: Object,
    default: null,
  },
  showAlign: {
    type: Boolean,
    default: false,
  },
  textAlign: {
    type: String,
    default: 'left',
  },
})

const emit = defineEmits(['update:textAlign'])

const isBold = ref(false)
const isItalic = ref(false)
const isStrike = ref(false)
const isCode = ref(false)
const isLink = ref(false)

function updateState() {
  if (!props.editorRef) {
    return
  }
  props.editorRef.syncFromDOM()
  isBold.value = props.editorRef.isFormatActive('bold')
  isItalic.value = props.editorRef.isFormatActive('italic')
  isStrike.value = props.editorRef.isFormatActive('strikethrough')
  isCode.value = props.editorRef.isFormatActive('code')
  isLink.value = props.editorRef.isFormatActive('link')
}

function handleFormat(type) {
  if (!props.editorRef) {
    return
  }

  if (type === 'link' && !isLink.value) {
    var url = prompt('请输入链接地址:')
    if (url) {
      props.editorRef.format('link', { href: url })
    }
  } else {
    props.editorRef.format(type)
  }
}

function setAlign(align) {
  emit('update:textAlign', align)
}

onMounted(function () {
  document.addEventListener('selectionchange', updateState)
})

onBeforeUnmount(function () {
  document.removeEventListener('selectionchange', updateState)
})
</script>

<template>
  <div class="block-editor-format-toolbar">
    <!-- 对齐按钮 -->
    <template v-if="showAlign">
      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': textAlign === 'left' || !textAlign }"
        title="左对齐"
        @click="setAlign('left')"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M4 5h16v1.5H4V5zm0 5.5h10V12H4v-1.5zm0 5.5h16v1.5H4V16z" fill="currentColor" />
        </svg>
      </button>

      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': textAlign === 'center' }"
        title="居中对齐"
        @click="setAlign('center')"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M4 5h16v1.5H4V5zm3 5.5h10V12H7v-1.5zM4 16h16v1.5H4V16z" fill="currentColor" />
        </svg>
      </button>

      <button
        type="button"
        class="format-button"
        :class="{ 'is-active': textAlign === 'right' }"
        title="右对齐"
        @click="setAlign('right')"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M4 5h16v1.5H4V5zm6 5.5h10V12H10v-1.5zM4 16h16v1.5H4V16z" fill="currentColor" />
        </svg>
      </button>

      <div class="format-divider"></div>
    </template>

    <!-- 格式按钮 -->
    <button
      type="button"
      class="format-button"
      :class="{ 'is-active': isBold }"
      title="加粗 (Ctrl+B)"
      @click="handleFormat('bold')"
    >
      <span v-html="getIcon('bold')"></span>
    </button>

    <button
      type="button"
      class="format-button"
      :class="{ 'is-active': isItalic }"
      title="斜体 (Ctrl+I)"
      @click="handleFormat('italic')"
    >
      <span v-html="getIcon('italic')"></span>
    </button>

    <button
      type="button"
      class="format-button"
      :class="{ 'is-active': isStrike }"
      title="删除线"
      @click="handleFormat('strikethrough')"
    >
      <span v-html="getIcon('strikethrough')"></span>
    </button>

    <div class="format-divider"></div>

    <button
      type="button"
      class="format-button"
      :class="{ 'is-active': isCode }"
      title="行内代码"
      @click="handleFormat('code')"
    >
      <span v-html="getIcon('codeInline')"></span>
    </button>

    <button
      type="button"
      class="format-button"
      :class="{ 'is-active': isLink }"
      title="链接 (Ctrl+K)"
      @click="handleFormat('link')"
    >
      <span v-html="getIcon('link')"></span>
    </button>
  </div>
</template>
