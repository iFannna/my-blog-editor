<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../store.js'
import { serialize, createBlock, getBlockType } from '../../blocks/index.js'
import EditorHeader from './EditorHeader.vue'
import LeftSidebar from './LeftSidebar.vue'
import RightSidebar from './RightSidebar.vue'
import BlockWrapper from './BlockWrapper.vue'
import BlockDropZone from './BlockDropZone.vue'
import KeyboardShortcutsModal from './KeyboardShortcutsModal.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'publish'])

const store = useEditorStore()
const editorContentRef = ref(null)

const leftSidebarVisible = ref(true)
const rightSidebarVisible = ref(true)

// 代码编辑器状态
const isCodeEditor = ref(false)
const codeContent = ref('')

// 快捷键弹窗
const showShortcutsModal = ref(false)

const blocks = computed(function () {
  return store.blocks
})

const isEmpty = computed(function () {
  return store.isEmpty
})

watch(
  blocks,
  function (newBlocks) {
    var html = serialize(newBlocks)
    emit('update:modelValue', html)
  },
  { deep: true },
)

function toggleLeftSidebar() {
  leftSidebarVisible.value = !leftSidebarVisible.value
}

function toggleRightSidebar() {
  rightSidebarVisible.value = !rightSidebarVisible.value
}

function handleSave() {
  if (isCodeEditor.value) {
    syncCodeToBlocks()
  }
  emit('save')
}

function handlePublish() {
  if (isCodeEditor.value) {
    syncCodeToBlocks()
  }
  emit('publish')
}

// 切换代码编辑器
function toggleCodeEditor() {
  if (isCodeEditor.value) {
    syncCodeToBlocks()
    isCodeEditor.value = false
  } else {
    codeContent.value = serialize(store.blocks)
    isCodeEditor.value = true
  }
}

// HTML 实体解码
function decodeHtmlEntities(text) {
  var textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

// 从 HTML 解析区块
function parseBlocksFromHtml(html) {
  var result = []

  // 匹配成对的 WordPress 块注释
  var pairedRegex = /<!-- wp:(\w+)(?:\s+(\{[^]*?\}))?\s*-->([\s\S]*?)<!-- \/wp:\1 -->/g
  var pairedMatch

  while ((pairedMatch = pairedRegex.exec(html)) !== null) {
    var blockName = 'core/' + pairedMatch[1]
    var attrJson = pairedMatch[2] || '{}'
    var innerContent = pairedMatch[3] || ''
    var attributes = {}

    try {
      attributes = JSON.parse(attrJson)
    } catch (e) {
      attributes = {}
    }

    var blockType = getBlockType(blockName)
    if (!blockType) {
      continue
    }

    extractBlockContent(blockName, innerContent, attributes)

    try {
      var block = createBlock(blockName, attributes)
      result.push(block)
    } catch (e) {
      console.warn('创建区块失败:', blockName, e)
    }
  }

  // 匹配自闭合的 WordPress 块注释
  var selfClosingRegex = /<!-- wp:(\w+)(?:\s+(\{[^]*?\}))?\s*\/-->/g
  var selfMatch

  while ((selfMatch = selfClosingRegex.exec(html)) !== null) {
    var scBlockName = 'core/' + selfMatch[1]
    var scAttrJson = selfMatch[2] || '{}'
    var scAttributes = {}

    try {
      scAttributes = JSON.parse(scAttrJson)
    } catch (e) {
      scAttributes = {}
    }

    var scBlockType = getBlockType(scBlockName)
    if (!scBlockType) {
      continue
    }

    try {
      var scBlock = createBlock(scBlockName, scAttributes)
      result.push(scBlock)
    } catch (e) {
      console.warn('创建区块失败:', scBlockName, e)
    }
  }

  return result
}

// 根据区块类型提取内容
function extractBlockContent(blockName, innerHtml, attributes) {
  var match

  switch (blockName) {
    case 'core/paragraph':
      match = innerHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
      if (match) {
        attributes.content = match[1]
      }
      break

    case 'core/heading':
      match = innerHtml.match(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/i)
      if (match) {
        attributes.level = parseInt(match[1], 10)
        attributes.content = match[2]
      }
      break

    case 'core/quote':
      var quoteMatch = innerHtml.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i)
      if (quoteMatch) {
        var quoteInner = quoteMatch[1]
        var pMatch = quoteInner.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
        if (pMatch) {
          attributes.content = pMatch[1]
        }
        var citeMatch = quoteInner.match(/<cite[^>]*>([\s\S]*?)<\/cite>/i)
        if (citeMatch) {
          attributes.citation = citeMatch[1]
        }
      }
      break

    case 'core/code':
      match = innerHtml.match(/<code[^>]*>([\s\S]*?)<\/code>/i)
      if (match) {
        attributes.content = decodeHtmlEntities(match[1])
      }
      var langMatch = innerHtml.match(/language-(\w+)/i)
      if (langMatch) {
        attributes.language = langMatch[1]
      }
      if (innerHtml.indexOf('is-light') !== -1) {
        attributes.theme = 'light'
      } else if (innerHtml.indexOf('is-dark') !== -1) {
        attributes.theme = 'dark'
      }
      break

    case 'core/list':
      var isOrdered = /<ol[^>]*>/i.test(innerHtml)
      attributes.ordered = isOrdered
      var listMatch = innerHtml.match(/<[ou]l[^>]*>([\s\S]*?)<\/[ou]l>/i)
      if (listMatch) {
        attributes.values = listMatch[1].trim()
      }
      break

    case 'core/verse':
      match = innerHtml.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)
      if (match) {
        attributes.content = match[1]
      }
      break

    case 'core/button':
      match = innerHtml.match(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/i)
      if (match) {
        attributes.url = match[1]
        attributes.text = match[2]
      } else {
        var textMatch = innerHtml.match(/<a[^>]*>([\s\S]*?)<\/a>/i)
        if (textMatch) {
          attributes.text = textMatch[1]
        }
      }
      break

    case 'core/cover':
      // 提取封面标题
      var coverPMatch = innerHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
      if (coverPMatch) {
        attributes.title = coverPMatch[1]
      }

      // 提取文本对齐
      var alignMatch = innerHtml.match(/has-text-align-(\w+)/i)
      if (alignMatch) {
        attributes.textAlign = alignMatch[1]
      }

      // 从 style 属性中提取样式
      var coverDivMatch = innerHtml.match(
        /<div[^>]*style=["']([^"']+)["'][^>]*class=["'][^"']*wp-block-cover/i,
      )
      if (!coverDivMatch) {
        coverDivMatch = innerHtml.match(
          /<div[^>]*class=["'][^"']*wp-block-cover[^"']*["'][^>]*style=["']([^"']+)["']/i,
        )
      }
      if (coverDivMatch) {
        var coverStyleStr = coverDivMatch[1]

        var coverBgImgMatch = coverStyleStr.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i)
        if (coverBgImgMatch) {
          attributes.url = coverBgImgMatch[1]
        }

        var coverBgColorMatch = coverStyleStr.match(/background-color:\s*([^;]+)/i)
        if (coverBgColorMatch) {
          attributes.backgroundColor = coverBgColorMatch[1].trim()
        }

        var coverHeightMatch = coverStyleStr.match(/min-height:\s*(\d+)px/i)
        if (coverHeightMatch) {
          attributes.minHeight = parseInt(coverHeightMatch[1], 10)
        }
      }
      break

    case 'core/image':
      var imgMatch = innerHtml.match(/<img[^>]+src=["']([^"']+)["']/i)
      if (imgMatch) {
        attributes.url = imgMatch[1]
      }
      var altMatch = innerHtml.match(/<img[^>]+alt=["']([^"']*)["']/i)
      if (altMatch) {
        attributes.alt = altMatch[1]
      }
      var captionMatch = innerHtml.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)
      if (captionMatch) {
        attributes.caption = captionMatch[1]
      }
      break

    case 'core/video':
      var videoMatch = innerHtml.match(/<video[^>]+src=["']([^"']+)["']/i)
      if (!videoMatch) {
        videoMatch = innerHtml.match(/<source[^>]+src=["']([^"']+)["']/i)
      }
      if (videoMatch) {
        attributes.src = videoMatch[1]
      }
      break

    case 'core/audio':
      var audioMatch = innerHtml.match(/<audio[^>]+src=["']([^"']+)["']/i)
      if (!audioMatch) {
        audioMatch = innerHtml.match(/<source[^>]+src=["']([^"']+)["']/i)
      }
      if (audioMatch) {
        attributes.src = audioMatch[1]
      }
      break

    case 'core/separator':
      if (innerHtml.indexOf('is-style-wide') !== -1) {
        attributes.style = 'wide'
      } else if (innerHtml.indexOf('is-style-dots') !== -1) {
        attributes.style = 'dots'
      } else {
        attributes.style = 'default'
      }
      break

    case 'core/table':
      var tableMatch = innerHtml.match(/<table[^>]*>([\s\S]*?)<\/table>/i)
      if (tableMatch) {
        var theadMatch = tableMatch[1].match(/<thead[^>]*>([\s\S]*?)<\/thead>/i)
        if (theadMatch) {
          attributes.head = extractTableRows(theadMatch[1])
        }
        var tbodyMatch = tableMatch[1].match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i)
        if (tbodyMatch) {
          attributes.body = extractTableRows(tbodyMatch[1])
        }
      }
      break
  }
}

// 提取表格行数据
function extractTableRows(html) {
  var rows = []
  var rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  var rowMatch

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    var cells = []
    var cellRegex = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi
    var cellMatch

    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push({ content: cellMatch[1] })
    }

    if (cells.length > 0) {
      rows.push({ cells: cells })
    }
  }

  return rows
}

// 将代码同步到区块
function syncCodeToBlocks() {
  var trimmed = codeContent.value.trim()

  if (!trimmed) {
    store.blocks.length = 0
    try {
      var emptyBlock = createBlock('core/paragraph', {})
      store.blocks.push(emptyBlock)
    } catch (e) {
      console.warn('创建空段落失败:', e)
    }
    store.saveHistory()
    return
  }

  var parsedBlocks = parseBlocksFromHtml(trimmed)

  if (parsedBlocks && parsedBlocks.length > 0) {
    store.blocks.length = 0
    for (var i = 0; i < parsedBlocks.length; i++) {
      store.blocks.push(parsedBlocks[i])
    }
    store.selectedBlockId = null
    store.saveHistory()
  } else {
    if (store.blocks.length === 0) {
      try {
        var emptyBlock = createBlock('core/paragraph', {})
        store.blocks.push(emptyBlock)
      } catch (e) {
        console.warn('创建空段落失败:', e)
      }
      store.saveHistory()
    }
  }
}

// 显示快捷键弹窗
function handleShowShortcuts() {
  showShortcutsModal.value = true
}

function handleCloseShortcuts() {
  showShortcutsModal.value = false
}

// 复制所有方块
function handleCopyAllBlocks() {
  var html = serialize(store.blocks)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(html)
      .then(function () {
        console.log('所有方块已复制到剪贴板')
      })
      .catch(function (err) {
        console.warn('复制失败:', err)
        fallbackCopy(html)
      })
  } else {
    fallbackCopy(html)
  }
}

function fallbackCopy(text) {
  var textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
  } catch (err) {
    console.warn('复制失败:', err)
  }
  document.body.removeChild(textarea)
}

function handleClickBlank() {
  store.clearSelection()
}

// 画布拖拽
function handleCanvasDragOver(e) {
  e.preventDefault()
}

function handleCanvasDrop(e) {
  var blockType = e.dataTransfer.getData('application/x-block-type')
  if (blockType) {
    e.preventDefault()
    store.insertBlock(blockType)
    store.stopDragging()
  }
}

function handleGlobalDragEnd() {
  store.stopDragging()
}

// 画布粘贴处理
function handleCanvasPaste(e) {
  if (isCodeEditor.value) return
  if (store.selectedBlockId) return

  var activeElement = document.activeElement
  if (
    activeElement &&
    (activeElement.isContentEditable ||
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA')
  ) {
    return
  }

  var clipboardData = e.clipboardData || window.clipboardData
  if (!clipboardData) return

  var text = clipboardData.getData('text/plain')
  if (!text) return

  var parsedBlocks = parseBlocksFromHtml(text)
  if (parsedBlocks && parsedBlocks.length > 0) {
    e.preventDefault()
    for (var i = 0; i < parsedBlocks.length; i++) {
      store.blocks.push(parsedBlocks[i])
    }
    store.saveHistory()
    return
  }

  var blockData = store.parseBlockHtml(text)
  if (blockData) {
    e.preventDefault()
    store.insertBlock(blockData.name, blockData.attributes)
  }
}

onMounted(function () {
  if (store.blocks.length === 0) {
    store.insertBlock('core/paragraph')
  }
  store.initHistory()

  document.addEventListener('dragend', handleGlobalDragEnd)
  document.addEventListener('paste', handleCanvasPaste)
})

onBeforeUnmount(function () {
  document.removeEventListener('dragend', handleGlobalDragEnd)
  document.removeEventListener('paste', handleCanvasPaste)
})
</script>

<template>
  <div class="editor-layout">
    <EditorHeader
      :left-sidebar-visible="leftSidebarVisible"
      :right-sidebar-visible="rightSidebarVisible"
      :is-code-editor="isCodeEditor"
      @toggle-left-sidebar="toggleLeftSidebar"
      @toggle-right-sidebar="toggleRightSidebar"
      @save="handleSave"
      @publish="handlePublish"
      @toggle-code-editor="toggleCodeEditor"
      @show-shortcuts="handleShowShortcuts"
      @copy-all-blocks="handleCopyAllBlocks"
    />

    <div class="editor-body">
      <LeftSidebar v-if="!isCodeEditor" :visible="leftSidebarVisible" />

      <div
        ref="editorContentRef"
        class="editor-content"
        :class="{ 'is-code-editor': isCodeEditor }"
        @click="handleClickBlank"
        @dragover="handleCanvasDragOver"
        @drop="handleCanvasDrop"
      >
        <!-- 代码编辑器模式 -->
        <div v-if="isCodeEditor" class="code-editor-wrapper">
          <div class="code-editor-container">
            <textarea
              v-model="codeContent"
              class="code-editor-textarea"
              spellcheck="false"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
            ></textarea>
          </div>
        </div>

        <!-- 可视化编辑器模式 -->
        <div v-else class="editor-canvas">
          <div class="editor-title-wrapper">
            <input type="text" class="editor-title-input" placeholder="添加文章标题" />
          </div>

          <div class="block-editor-block-list">
            <BlockDropZone :index="0" />

            <template v-for="(block, index) in blocks" :key="block.clientId">
              <BlockWrapper :block="block" :index="index" />
              <BlockDropZone :index="index + 1" />
            </template>

            <div v-if="isEmpty" class="empty-state">
              <p>从左侧拖入区块，或点击左侧区块添加</p>
            </div>
          </div>
        </div>
      </div>

      <RightSidebar v-if="!isCodeEditor" :visible="rightSidebarVisible" />
    </div>

    <KeyboardShortcutsModal :visible="showShortcutsModal" @close="handleCloseShortcuts" />
  </div>
</template>

<style scoped>
.editor-title-wrapper {
  margin-bottom: 24px;
}

.editor-title-input {
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  font-size: 2.5em;
  font-weight: 600;
  line-height: 1.4;
  color: #1e1e1e;
  outline: none;
}

.editor-title-input::placeholder {
  color: #949494;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #757575;
  font-size: 14px;
}

/* 代码编辑器 */
.editor-content.is-code-editor {
  display: block;
  background: #fff;
  overflow-y: auto;
}

.code-editor-wrapper {
  display: flex;
  justify-content: center;
  min-height: 100%;
  padding: 24px 48px;
}

.code-editor-container {
  width: 100%;
  max-width: 900px;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  background: #fff;
}

.code-editor-textarea {
  width: 100%;
  min-height: calc(100vh - 150px);
  padding: 24px;
  border: none;
  background: transparent;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;
  font-size: 15px;
  line-height: 2;
  color: #1e1e1e;
  resize: none;
  outline: none;
  box-sizing: border-box;
}

.code-editor-textarea::placeholder {
  color: #949494;
}
</style>
