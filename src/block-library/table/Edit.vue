<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useEditorStore } from '../../editor/store.js'
import { getIcon } from '@/icons/index.js'
import RichTextEditor from '../../editor/components/RichTextEditor.vue'
import FormatToolbar from '../../editor/components/FormatToolbar.vue'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()

// 表格图标
const tableIcon = getIcon('table')

// 初始行列数
const initialRowCount = ref(2)
const initialColumnCount = ref(2)

// 表格引用
const tableRef = ref(null)

// 当前选中的单元格
const selectedCell = ref(null)

// 当前编辑的单元格编辑器引用
const currentCellEditorRef = ref(null)

// 下拉菜单显示状态
const showTableMenu = ref(false)

// 当前对齐方式
const currentAlign = ref('left')

// 判断表格是否已创建
const isTableCreated = computed(function () {
  var body = props.attributes.body
  return body && Array.isArray(body) && body.length > 0
})

// body 数据
const body = computed({
  get: function () {
    return props.attributes.body || []
  },
  set: function (val) {
    emit('update:attributes', { body: val })
  },
})

// 监听选中状态
watch(
  function () {
    return props.isSelected
  },
  function (selected) {
    if (!selected) {
      selectedCell.value = null
      showTableMenu.value = false
      currentCellEditorRef.value = null
    }
  },
)

// 创建表格
function onCreateTable(e) {
  e.preventDefault()

  var rowCount = parseInt(initialRowCount.value, 10) || 2
  var colCount = parseInt(initialColumnCount.value, 10) || 2

  var newBody = []
  for (var i = 0; i < rowCount; i++) {
    var row = []
    for (var j = 0; j < colCount; j++) {
      row.push({ content: '', tag: 'td', align: 'left' })
    }
    newBody.push({ cells: row })
  }

  emit('update:attributes', {
    body: newBody,
    head: [],
  })

  store.commitBlockChanges()
}

// 更新单元格内容
function updateCellContent(rowIndex, cellIndex, content) {
  var newBody = JSON.parse(JSON.stringify(body.value))
  if (newBody[rowIndex] && newBody[rowIndex].cells && newBody[rowIndex].cells[cellIndex]) {
    newBody[rowIndex].cells[cellIndex].content = content
    body.value = newBody
  }
}

// 获取单元格内容的 computed
function getCellContent(rowIndex, cellIndex) {
  return body.value[rowIndex]?.cells?.[cellIndex]?.content || ''
}

// 设置单元格内容
function setCellContent(rowIndex, cellIndex, val) {
  updateCellContent(rowIndex, cellIndex, val)
}

// 选中单元格
function handleCellFocus(rowIndex, cellIndex, editorRef) {
  selectedCell.value = { rowIndex: rowIndex, cellIndex: cellIndex }
  currentCellEditorRef.value = editorRef

  var cell = body.value[rowIndex]?.cells?.[cellIndex]
  if (cell) {
    currentAlign.value = cell.align || 'left'
  }
}

// 单元格失焦
function handleCellBlur() {
  store.commitBlockChanges()
}

// 在前面插入行
function insertRowBefore() {
  if (!selectedCell.value) return
  insertRowAt(selectedCell.value.rowIndex)
  showTableMenu.value = false
}

// 插入后行
function insertRowAfter() {
  if (!selectedCell.value) return
  insertRowAt(selectedCell.value.rowIndex + 1)
  showTableMenu.value = false
}

// 在指定位置插入行
function insertRowAt(index) {
  var colCount = body.value[0]?.cells?.length || 2
  var cells = []
  for (var i = 0; i < colCount; i++) {
    cells.push({ content: '', tag: 'td', align: 'left' })
  }
  var newBody = JSON.parse(JSON.stringify(body.value))
  newBody.splice(index, 0, { cells: cells })
  body.value = newBody
  store.commitBlockChanges()
}

// 删除行
function deleteRow() {
  if (!selectedCell.value || body.value.length <= 1) return
  var newBody = JSON.parse(JSON.stringify(body.value))
  newBody.splice(selectedCell.value.rowIndex, 1)
  body.value = newBody
  selectedCell.value = null
  currentCellEditorRef.value = null
  store.commitBlockChanges()
  showTableMenu.value = false
}

// 在前面插入列
function insertColumnBefore() {
  if (!selectedCell.value) return
  insertColumnAt(selectedCell.value.cellIndex)
  showTableMenu.value = false
}

// 插入后列
function insertColumnAfter() {
  if (!selectedCell.value) return
  insertColumnAt(selectedCell.value.cellIndex + 1)
  showTableMenu.value = false
}

// 在指定位置插入列
function insertColumnAt(colIndex) {
  var newBody = JSON.parse(JSON.stringify(body.value))
  newBody.forEach(function (row) {
    row.cells.splice(colIndex, 0, { content: '', tag: 'td', align: 'left' })
  })
  body.value = newBody
  store.commitBlockChanges()
}

// 删除列
function deleteColumn() {
  if (!selectedCell.value || !body.value[0] || body.value[0].cells.length <= 1) return
  var newBody = JSON.parse(JSON.stringify(body.value))
  newBody.forEach(function (row) {
    row.cells.splice(selectedCell.value.cellIndex, 1)
  })
  body.value = newBody
  selectedCell.value = null
  currentCellEditorRef.value = null
  store.commitBlockChanges()
  showTableMenu.value = false
}

// 切换对齐方式
function toggleAlign() {
  var aligns = ['left', 'center', 'right']
  var currentIndex = aligns.indexOf(currentAlign.value)
  var newAlign = aligns[(currentIndex + 1) % 3]
  currentAlign.value = newAlign

  if (selectedCell.value) {
    var newBody = JSON.parse(JSON.stringify(body.value))
    newBody.forEach(function (row) {
      if (row.cells[selectedCell.value.cellIndex]) {
        row.cells[selectedCell.value.cellIndex].align = newAlign
      }
    })
    body.value = newBody
    store.commitBlockChanges()
  }
}

// 切换下拉菜单
function toggleTableMenu(e) {
  e.stopPropagation()
  showTableMenu.value = !showTableMenu.value
}

// 点击外部关闭菜单
function handleClickOutside(e) {
  if (!e.target.closest('.table-menu-wrapper')) {
    showTableMenu.value = false
  }
}

onMounted(function () {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(function () {
  document.removeEventListener('click', handleClickOutside)
})

// 对齐图标
var alignIcons = {
  left: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 5h16v1.5H4V5zm0 5.5h10V12H4v-1.5zm0 5.5h16v1.5H4V16z" fill="currentColor"/></svg>',
  center:
    '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 5h16v1.5H4V5zm3 5.5h10V12H7v-1.5zM4 16h16v1.5H4V16z" fill="currentColor"/></svg>',
  right:
    '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 5h16v1.5H4V5zm6 5.5h10V12H10v-1.5zM4 16h16v1.5H4V16z" fill="currentColor"/></svg>',
}

function getAlignIcon() {
  return alignIcons[currentAlign.value] || alignIcons.left
}
</script>

<template>
  <!-- 未创建表格：显示占位符 -->
  <div v-if="!isTableCreated" class="wp-block-table-placeholder">
    <div class="placeholder-content">
      <div class="placeholder-label">
        <span class="placeholder-icon" v-html="tableIcon"></span>
        <span>表格</span>
      </div>
      <div class="placeholder-instructions">插入一个用于共享数据的表格。</div>
      <form class="placeholder-form" @submit="onCreateTable">
        <div class="form-field">
          <label class="form-label">列数</label>
          <input type="number" class="form-input" v-model.number="initialColumnCount" min="1" />
        </div>
        <div class="form-field">
          <label class="form-label">行数</label>
          <input type="number" class="form-input" v-model.number="initialRowCount" min="1" />
        </div>
        <button type="submit" class="create-button">创建表格</button>
      </form>
    </div>
  </div>

  <!-- 已创建表格 -->
  <div v-else class="wp-block-table-wrapper" ref="tableRef">
    <!-- 工具栏 -->
    <div v-if="isSelected" class="block-editor-format-toolbar table-toolbar">
      <div class="table-menu-wrapper">
        <button
          type="button"
          class="format-button"
          :class="{ 'is-active': showTableMenu }"
          title="编辑表格"
          @click="toggleTableMenu"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm.5 2v6.2h-6.8V4.4h6.2c.3 0 .5.2.5.5ZM5 4.5h6.2v6.8H4.4V5.1c0-.3.2-.5.5-.5ZM4.5 19v-6.2h6.8v6.8H5.1c-.3 0-.5-.2-.5-.5Zm14.5.5h-6.2v-6.8h6.8v6.2c0 .3-.2.5-.5.5Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <!-- 下拉菜单 -->
        <div v-show="showTableMenu" class="table-dropdown-menu" @click.stop>
          <button
            type="button"
            class="menu-item"
            :disabled="!selectedCell"
            @click="insertRowBefore"
          >
            <span class="menu-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M21 5c0-1.1-.9-2-2-2H5c-1 0-1.9.8-2 1.8V19.2c.1.9.9 1.7 1.8 1.8H19c1.1 0 2-.9 2-2V5ZM4.5 14V5c0-.3.2-.5.5-.5h14c.3 0 .5.2.5.5v9h-15Zm4 5.5H5c-.3 0-.5-.2-.5-.5v-3.5h4v4Zm5.5 0h-4v-4h4v4Zm5.5-.5c0 .3-.2.5-.5.5h-3.5v-4h4V19ZM11.2 10h-3V8.5h3v-3h1.5v3h3V10h-3v3h-1.5v-3Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span class="menu-label">在前面插入行</span>
          </button>

          <button type="button" class="menu-item" :disabled="!selectedCell" @click="insertRowAfter">
            <span class="menu-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M19 3H4.8c-.9.1-1.7.9-1.8 1.8V19.2c.1 1 1 1.8 2 1.8h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-9 1.5h4v4h-4v-4ZM4.5 5c0-.3.2-.5.5-.5h3.5v4h-4V5Zm15 14c0 .3-.2.5-.5.5H5c-.3 0-.5-.2-.5-.5v-9h15v9Zm0-10.5h-4v-4H19c.3 0 .5.2.5.5v3.5Zm-8.3 10h1.5v-3h3V14h-3v-3h-1.5v3h-3v1.5h3v3Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span class="menu-label">插入后行</span>
          </button>

          <button
            type="button"
            class="menu-item is-danger"
            :disabled="!selectedCell || body.length <= 1"
            @click="deleteRow"
          >
            <span class="menu-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M19 3H4.8c-.9.1-1.7.9-1.8 1.8V19.2c.1 1 1 1.8 2 1.8h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm.5 16c0 .3-.2.5-.5.5H5c-.3 0-.5-.2-.5-.5v-9h15v9Zm0-10.5h-15V5c0-.3.2-.5.5-.5h14c.3 0 .5.2.5.5v3.5Zm-9.6 9.4 2.1-2.1 2.1 2.1 1.1-1.1-2.1-2.1 2.1-2.1-1.1-1.1-2.1 2.1-2.1-2.1-1.1 1.1 2.1 2.1-2.1 2.1 1.1 1.1Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span class="menu-label">删除行</span>
          </button>

          <div class="menu-divider"></div>

          <button
            type="button"
            class="menu-item"
            :disabled="!selectedCell"
            @click="insertColumnBefore"
          >
            <span class="menu-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1 .8 1.9 1.8 2H19.2c.9-.1 1.7-.9 1.8-1.8V5c0-1.1-.9-2-2-2Zm-5 16.5H5c-.3 0-.5-.2-.5-.5V5c0-.3.2-.5.5-.5h9v15Zm5.5-.5c0 .3-.2.5-.5.5h-3.5v-4h4V19Zm0-5h-4v-4h4v4Zm0-5.5h-4v-4H19c.3 0 .5.2.5.5v3.5Zm-11 7.3H10v-3h3v-1.5h-3v-3H8.5v3h-3v1.5h3v3Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span class="menu-label">在前面插入列</span>
          </button>

          <button
            type="button"
            class="menu-item"
            :disabled="!selectedCell"
            @click="insertColumnAfter"
          >
            <span class="menu-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14.2c.1.9.9 1.7 1.8 1.8H19.2c1-.1 1.8-1 1.8-2V5c0-1.1-.9-2-2-2ZM8.5 19.5H5c-.3 0-.5-.2-.5-.5v-3.5h4v4Zm0-5.5h-4v-4h4v4Zm0-5.5h-4V5c0-.3.2-.5.5-.5h3.5v4Zm11 10.5c0 .3-.2.5-.5.5h-9v-15h9c.3 0 .5.2.5.5v14Zm-4-10.8H14v3h-3v1.5h3v3h1.5v-3h3v-1.5h-3v-3Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span class="menu-label">插入列</span>
          </button>

          <button
            type="button"
            class="menu-item is-danger"
            :disabled="!selectedCell || !body[0] || body[0].cells.length <= 1"
            @click="deleteColumn"
          >
            <span class="menu-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14.2c.1.9.9 1.7 1.8 1.8H19.2c1-.1 1.8-1 1.8-2V5c0-1.1-.9-2-2-2ZM8.5 19.5H5c-.3 0-.5-.2-.5-.5V5c0-.3.2-.5.5-.5h3.5v15Zm11-.5c0 .3-.2.5-.5.5h-9v-15h9c.3 0 .5.2.5.5v14ZM16.9 8.8l-2.1 2.1-2.1-2.1-1.1 1.1 2.1 2.1-2.1 2.1 1.1 1.1 2.1-2.1 2.1 2.1 1.1-1.1-2.1-2.1L18 9.9l-1.1-1.1Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span class="menu-label">删除列</span>
          </button>
        </div>
      </div>
      <!-- 对齐按钮 -->
      <button
        type="button"
        class="format-button"
        :title="'列对齐: ' + currentAlign"
        @click="toggleAlign"
        v-html="getAlignIcon()"
      ></button>

      <div class="format-divider"></div>
      <!-- 富文本格式工具栏 -->
      <FormatToolbar v-if="currentCellEditorRef" :editor-ref="currentCellEditorRef" />
      <!-- 编辑表格下拉菜单 -->
    </div>

    <!-- 表格主体 -->
    <figure class="wp-block-table">
      <table>
        <tbody>
          <tr v-for="(row, rowIndex) in body" :key="'row-' + rowIndex">
            <td
              v-for="(cell, cellIndex) in row.cells"
              :key="'cell-' + cellIndex"
              :class="{
                'is-selected':
                  selectedCell &&
                  selectedCell.rowIndex === rowIndex &&
                  selectedCell.cellIndex === cellIndex,
              }"
              :style="{ textAlign: cell.align || 'left' }"
            >
              <RichTextEditor
                :ref="
                  function (el) {
                    if (
                      el &&
                      selectedCell &&
                      selectedCell.rowIndex === rowIndex &&
                      selectedCell.cellIndex === cellIndex
                    )
                      currentCellEditorRef = el
                  }
                "
                :model-value="cell.content"
                @update:model-value="updateCellContent(rowIndex, cellIndex, $event)"
                tag="div"
                class="table-cell-editor"
                placeholder=""
                @focus="handleCellFocus(rowIndex, cellIndex, $event)"
                @blur="handleCellBlur"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </figure>
  </div>
</template>

<style scoped>
/* ========== 强制移除所有滚动条 ========== */
.wp-block-table-wrapper,
.wp-block-table-wrapper *,
.wp-block-table,
.wp-block-table *,
.table-dropdown-menu,
.table-dropdown-menu * {
  overflow: visible !important;
  overflow-x: visible !important;
  overflow-y: visible !important;
}

.block-editor-block-content {
  padding: 0 !important;
}
/* ========== 占位符样式 ========== */
.wp-block-table-placeholder {
  box-sizing: border-box;
  width: 100%;
  padding: 24px;
  border: 1px solid #1e1e1e;
  border-radius: 2px;
  background: #fff;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.placeholder-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e1e1e;
}

.placeholder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.placeholder-icon :deep(svg) {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.placeholder-instructions {
  font-size: 13px;
  color: #757575;
}

.placeholder-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 11px;
  font-weight: 500;
  color: #1e1e1e;
  text-transform: uppercase;
}

.form-input {
  width: 100px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #949494;
  border-radius: 2px;
  font-size: 14px;
  color: #1e1e1e;
  background: #fff;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3858e9;
  box-shadow: 0 0 0 1px #3858e9;
}

.create-button {
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 2px;
  background: #3858e9;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.1s ease;
}

.create-button:hover {
  background: #2145e6;
}

.create-button:focus {
  outline: none;
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 4px #3858e9;
}

/* ========== 表格包装器 ========== */
.wp-block-table-wrapper {
  width: 100%;
}

/* ========== 表格样式 ========== */
.wp-block-table {
  margin: 0;
  width: 100%;
}

.wp-block-table table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #1e1e1e;
  table-layout: fixed;
}

.wp-block-table td {
  border: 1px solid #1e1e1e;
  padding: 0;
  vertical-align: top;
  word-break: break-word;
}

.wp-block-table td.is-selected {
  border-color: #3858e9;
  box-shadow: inset 0 0 0 1px #3858e9;
}

/* 单元格编辑器 */
.table-cell-editor {
  min-height: 1.5em;
  padding: 0.5em;
  outline: none;
}

.table-cell-editor:focus {
  outline: none;
}

/* ========== 工具栏样式 ========== */
.table-toolbar {
  margin-bottom: 12px;
}

/* ========== 下拉菜单 ========== */
.table-menu-wrapper {
  position: relative;
}

.table-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 160px;
  background: #fff;
  border: 1px solid #1e1e1e;
  border-radius: 2px;

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

.menu-item:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.menu-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.menu-item.is-danger {
  color: #cc1818;
}

.menu-item.is-danger:hover:not(:disabled) {
  background-color: #fef0f0;
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
  white-space: nowrap;
}

.menu-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
}
</style>
