/**
 * Pinia 状态管理 - 含历史记录
 */

import { defineStore } from 'pinia'
import { createBlock } from '../blocks/index.js'

var MAX_HISTORY = 50

// 防抖定时器
var saveHistoryTimer = null
var DEBOUNCE_DELAY = 500

export const useEditorStore = defineStore('editor', {
  state: function () {
    return {
      blocks: [],
      selectedBlockId: null,
      draggingBlockId: null,
      dragOverIndex: null,
      history: [],
      historyIndex: -1,
      isHistoryAction: false,
    }
  },

  getters: {
    selectedBlock: function (state) {
      return state.blocks.find(function (b) {
        return b.clientId === state.selectedBlockId
      })
    },

    isEmpty: function (state) {
      return state.blocks.length === 0
    },

    blocksCount: function (state) {
      return state.blocks.length
    },

    isDragging: function (state) {
      return state.draggingBlockId !== null
    },

    canUndo: function (state) {
      return state.historyIndex > 0
    },

    canRedo: function (state) {
      return state.historyIndex < state.history.length - 1
    },
  },

  actions: {
    // 立即保存历史记录（用于明确的操作如删除、移动等）
    saveHistory: function () {
      if (this.isHistoryAction) {
        return
      }

      // 清除防抖定时器
      if (saveHistoryTimer) {
        clearTimeout(saveHistoryTimer)
        saveHistoryTimer = null
      }

      this._doSaveHistory()
    },

    // 延迟保存历史记录（用于连续输入）
    saveHistoryDebounced: function () {
      var self = this

      if (this.isHistoryAction) {
        return
      }

      if (saveHistoryTimer) {
        clearTimeout(saveHistoryTimer)
      }

      saveHistoryTimer = setTimeout(function () {
        self._doSaveHistory()
        saveHistoryTimer = null
      }, DEBOUNCE_DELAY)
    },

    // 实际保存历史
    _doSaveHistory: function () {
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1)
      }

      var snapshot = JSON.stringify(this.blocks)

      if (this.history.length > 0 && this.history[this.history.length - 1] === snapshot) {
        return
      }

      this.history.push(snapshot)

      if (this.history.length > MAX_HISTORY) {
        this.history.shift()
      } else {
        this.historyIndex = this.history.length - 1
      }
    },

    undo: function () {
      if (!this.canUndo) {
        return
      }

      // 清除防抖定时器
      if (saveHistoryTimer) {
        clearTimeout(saveHistoryTimer)
        saveHistoryTimer = null
      }

      this.isHistoryAction = true
      this.historyIndex--
      this.blocks = JSON.parse(this.history[this.historyIndex])
      this.selectedBlockId = null
      this.isHistoryAction = false
    },

    redo: function () {
      if (!this.canRedo) {
        return
      }

      if (saveHistoryTimer) {
        clearTimeout(saveHistoryTimer)
        saveHistoryTimer = null
      }

      this.isHistoryAction = true
      this.historyIndex++
      this.blocks = JSON.parse(this.history[this.historyIndex])
      this.selectedBlockId = null
      this.isHistoryAction = false
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

    // 更新属性 - 使用防抖保存
    updateBlockAttributes: function (clientId, attributes) {
      var block = this.blocks.find(function (b) {
        return b.clientId === clientId
      })
      if (block) {
        block.attributes = Object.assign({}, block.attributes, attributes)
        // 不立即保存，等待防抖或明确的完成信号
      }
    },

    // 内容编辑完成 - 立即保存历史
    commitBlockChanges: function () {
      this.saveHistory()
    },

    removeBlock: function (clientId) {
      var index = this.blocks.findIndex(function (b) {
        return b.clientId === clientId
      })
      if (index !== -1) {
        this.blocks.splice(index, 1)
        this.selectedBlockId = null
        this.saveHistory()
      }
    },

    moveBlock: function (clientId, direction) {
      var index = this.blocks.findIndex(function (b) {
        return b.clientId === clientId
      })
      var newIndex = direction === 'up' ? index - 1 : index + 1

      if (newIndex >= 0 && newIndex < this.blocks.length) {
        var block = this.blocks.splice(index, 1)[0]
        this.blocks.splice(newIndex, 0, block)
        this.saveHistory()
      }
    },

    moveBlockByIndex: function (fromIndex, toIndex) {
      if (fromIndex === toIndex) {
        return
      }
      if (fromIndex < 0 || fromIndex >= this.blocks.length) {
        return
      }
      if (toIndex < 0 || toIndex > this.blocks.length) {
        return
      }

      var block = this.blocks.splice(fromIndex, 1)[0]
      var adjustedIndex = toIndex > fromIndex ? toIndex - 1 : toIndex
      this.blocks.splice(adjustedIndex, 0, block)
      this.selectedBlockId = block.clientId
      this.saveHistory()
    },

    moveBlockToIndex: function (clientId, toIndex) {
      var fromIndex = this.blocks.findIndex(function (b) {
        return b.clientId === clientId
      })

      if (fromIndex === -1) {
        return
      }

      this.moveBlockByIndex(fromIndex, toIndex)
    },

    selectBlock: function (clientId) {
      this.selectedBlockId = clientId
    },

    clearSelection: function () {
      this.selectedBlockId = null
    },

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
  },
})
