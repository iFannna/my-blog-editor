/**
 * 富文本编辑 composable
 */

import { ref, watch, onMounted, onBeforeUnmount, toValue } from 'vue'
import {
  create,
  toHtmlString,
  toggleFormat,
  applyFormat,
  removeFormat,
  getActiveFormats,
} from '../rich-text/index.js'

export function useRichText(options) {
  var value = options.value
  var onChange = options.onChange
  var onChangeComplete = options.onChangeComplete

  var editorRef = ref(null)
  var richTextValue = ref(create({ html: toValue(value) }))

  var isComposing = ref(false)

  function syncFromDOM() {
    if (!editorRef.value) {
      return
    }

    var html = editorRef.value.innerHTML
    richTextValue.value = create({ html: html })

    var selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      var range = selection.getRangeAt(0)
      var offsets = getTextOffsets(editorRef.value, range)
      richTextValue.value.start = offsets.startOffset
      richTextValue.value.end = offsets.endOffset
    }
  }

  function syncToDOM() {
    if (!editorRef.value) {
      return
    }

    var html = toHtmlString({ value: richTextValue.value })
    var start = richTextValue.value.start
    var end = richTextValue.value.end

    editorRef.value.innerHTML = html
    onChange(html)

    if (start !== undefined && end !== undefined) {
      restoreSelection(editorRef.value, start, end)
    }
  }

  function format(formatType, attributes) {
    syncFromDOM()

    var formatObj = { type: formatType }
    if (attributes) {
      formatObj.attributes = attributes
    }

    richTextValue.value = toggleFormat(richTextValue.value, formatObj)
    syncToDOM()

    if (onChangeComplete) {
      onChangeComplete()
    }
  }

  // 专门用于高亮的方法，使用传入的 start/end
  function applyHighlight(start, end, attributes) {
    if (start === undefined || end === undefined || start >= end) {
      return
    }

    // 先同步当前 DOM 内容（但不读取选区）
    if (editorRef.value) {
      var html = editorRef.value.innerHTML
      richTextValue.value = create({ html: html })
    }

    // 使用传入的 start/end
    richTextValue.value.start = start
    richTextValue.value.end = end

    var formatObj = {
      type: 'highlight',
      attributes: attributes || {},
    }

    richTextValue.value = applyFormat(richTextValue.value, formatObj)
    syncToDOM()

    if (onChangeComplete) {
      onChangeComplete()
    }
  }

  // 移除高亮
  function removeHighlightFormat(start, end) {
    if (editorRef.value) {
      var html = editorRef.value.innerHTML
      richTextValue.value = create({ html: html })
    }

    if (start !== undefined && end !== undefined) {
      richTextValue.value.start = start
      richTextValue.value.end = end
    }

    richTextValue.value = removeFormat(richTextValue.value, 'highlight')
    syncToDOM()

    if (onChangeComplete) {
      onChangeComplete()
    }
  }

  function isFormatActive(formatType) {
    var active = getActiveFormats(richTextValue.value)
    return active.some(function (f) {
      return f.type === formatType
    })
  }

  function getActiveFormat(formatType) {
    var active = getActiveFormats(richTextValue.value)
    return active.find(function (f) {
      return f.type === formatType
    })
  }

  // 获取当前选区
  function getSelection() {
    syncFromDOM()
    return {
      start: richTextValue.value.start,
      end: richTextValue.value.end,
    }
  }

  function handleInput() {
    syncFromDOM()
    onChange(toHtmlString({ value: richTextValue.value }))

    if (!isComposing.value && onChangeComplete) {
      onChangeComplete()
    }
  }

  function handleCompositionStart() {
    isComposing.value = true
  }

  function handleCompositionEnd() {
    isComposing.value = false

    syncFromDOM()
    onChange(toHtmlString({ value: richTextValue.value }))

    if (onChangeComplete) {
      onChangeComplete()
    }
  }

  function handleKeyDown(e) {
    var isMod = e.metaKey || e.ctrlKey

    if (isMod) {
      var key = e.key.toLowerCase()

      if (key === 'b') {
        e.preventDefault()
        format('bold')
      } else if (key === 'i') {
        e.preventDefault()
        format('italic')
      } else if (key === 'k') {
        e.preventDefault()
        var url = prompt('输入链接地址:')
        if (url) {
          format('link', { href: url })
        }
      }
    }
  }

  watch(
    function () {
      return toValue(value)
    },
    function (newHtml) {
      var currentHtml = toHtmlString({ value: richTextValue.value })
      if (newHtml !== currentHtml && editorRef.value) {
        richTextValue.value = create({ html: newHtml })
        editorRef.value.innerHTML = newHtml || ''
      }
    },
  )

  onMounted(function () {
    if (editorRef.value) {
      editorRef.value.innerHTML = toValue(value) || ''
      editorRef.value.addEventListener('input', handleInput)
      editorRef.value.addEventListener('keydown', handleKeyDown)
      editorRef.value.addEventListener('compositionstart', handleCompositionStart)
      editorRef.value.addEventListener('compositionend', handleCompositionEnd)
    }
  })

  onBeforeUnmount(function () {
    if (editorRef.value) {
      editorRef.value.removeEventListener('input', handleInput)
      editorRef.value.removeEventListener('keydown', handleKeyDown)
      editorRef.value.removeEventListener('compositionstart', handleCompositionStart)
      editorRef.value.removeEventListener('compositionend', handleCompositionEnd)
    }
  })

  return {
    editorRef: editorRef,
    richTextValue: richTextValue,
    format: format,
    isFormatActive: isFormatActive,
    getActiveFormat: getActiveFormat,
    syncFromDOM: syncFromDOM,
    isComposing: isComposing,
    getSelection: getSelection,
    applyHighlight: applyHighlight,
    removeHighlightFormat: removeHighlightFormat,
  }
}

function getTextOffsets(container, range) {
  var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)

  var offset = 0
  var startOffset = 0
  var endOffset = 0
  var node

  while ((node = walker.nextNode())) {
    var len = node.textContent ? node.textContent.length : 0

    if (node === range.startContainer) {
      startOffset = offset + range.startOffset
    }
    if (node === range.endContainer) {
      endOffset = offset + range.endOffset
      break
    }
    offset += len
  }

  return {
    startOffset: startOffset,
    endOffset: endOffset,
  }
}

function restoreSelection(container, start, end) {
  var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)

  var offset = 0
  var startNode = null
  var endNode = null
  var startOff = 0
  var endOff = 0
  var node

  while ((node = walker.nextNode())) {
    var len = node.textContent ? node.textContent.length : 0

    if (!startNode && offset + len >= start) {
      startNode = node
      startOff = start - offset
    }
    if (!endNode && offset + len >= end) {
      endNode = node
      endOff = end - offset
      break
    }
    offset += len
  }

  if (startNode && endNode) {
    var sel = window.getSelection()
    var range = document.createRange()
    range.setStart(startNode, startOff)
    range.setEnd(endNode, endOff)
    if (sel) {
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }
}
