import { defineStore } from 'pinia'
import { getBlockType, createBlock } from '../blocks/index.js'

export const useEditorStore = defineStore('editor', {
  state: function () {
    return {
      blocks: [],
      selectedBlockId: null,
      history: [],
      historyIndex: -1,
      maxHistory: 50,
      draggingBlockId: null,
      dragOverIndex: null,
    }
  },

  getters: {
    isEmpty: function (state) {
      if (state.blocks.length === 0) return true
      if (state.blocks.length === 1) {
        var block = state.blocks[0]
        if (block.name === 'core/paragraph') {
          var content = block.attributes.content || ''
          return !content || content === '<br>' || content.replace(/<[^>]+>/g, '').trim() === ''
        }
      }
      return false
    },

    blocksCount: function (state) {
      return state.blocks.length
    },

    selectedBlock: function (state) {
      if (!state.selectedBlockId) return null
      return state.blocks.find(function (b) {
        return b.clientId === state.selectedBlockId
      })
    },

    canUndo: function (state) {
      return state.historyIndex > 0
    },

    canRedo: function (state) {
      return state.historyIndex < state.history.length - 1
    },
  },

  actions: {
    selectBlock: function (clientId) {
      this.selectedBlockId = clientId
    },

    clearSelection: function () {
      this.selectedBlockId = null
    },

    // ========== 历史记录 ==========

    saveHistory: function () {
      var snapshot = JSON.stringify(this.blocks)

      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1)
      }

      this.history.push(snapshot)

      if (this.history.length > this.maxHistory) {
        this.history.shift()
      } else {
        this.historyIndex++
      }
    },

    undo: function () {
      if (this.historyIndex > 0) {
        this.historyIndex--
        var snapshot = this.history[this.historyIndex]
        this.blocks = JSON.parse(snapshot)
        this.selectedBlockId = null
      }
    },

    redo: function () {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++
        var snapshot = this.history[this.historyIndex]
        this.blocks = JSON.parse(snapshot)
        this.selectedBlockId = null
      }
    },

    commitBlockChanges: function () {
      this.saveHistory()
    },

    initHistory: function () {
      this.history = [JSON.stringify(this.blocks)]
      this.historyIndex = 0
    },

    setBlocks: function (blocks) {
      this.blocks = blocks
      this.saveHistory()
    },

    insertBlock: function (blockName, attributes, index) {
      attributes = attributes || {}
      var block = createBlock(blockName, attributes)
      var insertAt = index !== undefined ? index : this.blocks.length
      this.blocks.splice(insertAt, 0, block)
      this.selectedBlockId = block.clientId
      this.saveHistory()
      return block
    },

    // 在指定位置插入解析后的块
    insertBlockAt: function (blockName, attributes, index) {
      var block = createBlock(blockName, attributes)
      this.blocks.splice(index, 0, block)
      this.selectedBlockId = block.clientId
      this.saveHistory()
      return block
    },

    updateBlockAttributes: function (clientId, attributes) {
      var block = this.blocks.find(function (b) {
        return b.clientId === clientId
      })
      if (block) {
        Object.assign(block.attributes, attributes)
      }
    },

    removeBlock: function (clientId) {
      var index = this.blocks.findIndex(function (b) {
        return b.clientId === clientId
      })
      if (index !== -1) {
        this.blocks.splice(index, 1)
        if (this.selectedBlockId === clientId) {
          this.selectedBlockId = null
        }
        this.saveHistory()
      }
    },

    moveBlock: function (clientId, direction) {
      var index = this.blocks.findIndex(function (b) {
        return b.clientId === clientId
      })
      if (index === -1) return

      var newIndex = direction === 'up' ? index - 1 : index + 1

      if (newIndex < 0 || newIndex >= this.blocks.length) return

      var temp = this.blocks[index]
      this.blocks[index] = this.blocks[newIndex]
      this.blocks[newIndex] = temp
      this.saveHistory()
    },

    moveBlockToIndex: function (clientId, newIndex) {
      var oldIndex = this.blocks.findIndex(function (b) {
        return b.clientId === clientId
      })
      if (oldIndex === -1) return
      if (oldIndex === newIndex) return

      var block = this.blocks.splice(oldIndex, 1)[0]

      if (newIndex > oldIndex) {
        newIndex--
      }

      this.blocks.splice(newIndex, 0, block)
      this.saveHistory()
    },

    duplicateBlock: function (clientId) {
      var index = this.blocks.findIndex(function (b) {
        return b.clientId === clientId
      })
      if (index === -1) return

      var block = this.blocks[index]
      var newBlock = createBlock(block.name, JSON.parse(JSON.stringify(block.attributes)))

      this.blocks.splice(index + 1, 0, newBlock)
      this.selectedBlockId = newBlock.clientId
      this.saveHistory()
    },

    // ========== 拖拽 ==========

    startDragging: function (clientId) {
      this.draggingBlockId = clientId
    },

    stopDragging: function () {
      this.draggingBlockId = null
      this.dragOverIndex = null
    },

    setDragOverIndex: function (index) {
      this.dragOverIndex = index
    },

    getBlockIndex: function (clientId) {
      return this.blocks.findIndex(function (b) {
        return b.clientId === clientId
      })
    },

    // ========== 序列化和解析块 ==========

    // 序列化块为 WordPress 风格的 HTML
    serializeBlock: function (block) {
      var blockType = getBlockType(block.name)
      if (!blockType) {
        return ''
      }

      var blockName = block.name.replace('core/', '')
      var attributes = block.attributes || {}

      // 生成块内容
      var content = ''
      if (blockType.save) {
        content = blockType.save({ attributes: attributes })
      }

      // 生成属性 JSON（如果有非默认属性）
      var attrDefs = blockType.attributes || {}
      var nonDefaultAttrs = {}
      var hasNonDefault = false

      for (var key in attributes) {
        var defaultVal = attrDefs[key] ? attrDefs[key].default : undefined
        if (JSON.stringify(attributes[key]) !== JSON.stringify(defaultVal)) {
          nonDefaultAttrs[key] = attributes[key]
          hasNonDefault = true
        }
      }

      var attrStr = ''
      if (hasNonDefault) {
        attrStr = ' ' + JSON.stringify(nonDefaultAttrs)
      }

      // 生成 WordPress 风格的 HTML
      var html = '<!-- wp:' + blockName + attrStr + ' -->\n'
      html += content + '\n'
      html += '<!-- /wp:' + blockName + ' -->'

      return html
    },

    // 解析 WordPress 风格的 HTML 为块数据
    parseBlockHtml: function (html) {
      if (!html || typeof html !== 'string') {
        return null
      }

      // 匹配 WordPress 块注释
      // 修改：将 \w+ 改为 [\w-]+ 以支持带连字符的块名称如 media-text
      var regex = /<!-- wp:([\w-]+)(?:\s+(\{[\s\S]*?\}))?\s*-->\s*([\s\S]*?)\s*<!-- \/wp:\1 -->/
      var match = html.trim().match(regex)

      if (!match) {
        return null
      }

      var blockName = 'core/' + match[1]
      var attrJson = match[2] || '{}'
      var attributes = {}

      try {
        attributes = JSON.parse(attrJson)
      } catch (e) {
        attributes = {}
      }

      // 验证块类型是否存在
      var blockType = getBlockType(blockName)
      if (!blockType) {
        return null
      }

      return {
        name: blockName,
        attributes: attributes,
      }
    },
  },
})
