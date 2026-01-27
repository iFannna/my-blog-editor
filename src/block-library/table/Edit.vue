<script setup>
import { computed } from 'vue'
import { useEditorStore } from '../../editor/store.js'

const props = defineProps({
  attributes: { type: Object, required: true },
  clientId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attributes'])
const store = useEditorStore()

const head = computed({
  get: function () {
    return props.attributes.head || [['标题1', '标题2']]
  },
  set: function (val) {
    emit('update:attributes', { head: val })
  },
})

const body = computed({
  get: function () {
    return props.attributes.body || [['', '']]
  },
  set: function (val) {
    emit('update:attributes', { body: val })
  },
})

function updateHeadCell(rowIndex, cellIndex, value) {
  var newHead = JSON.parse(JSON.stringify(head.value))
  newHead[rowIndex][cellIndex] = value
  head.value = newHead
  store.commitBlockChanges()
}

function updateBodyCell(rowIndex, cellIndex, value) {
  var newBody = JSON.parse(JSON.stringify(body.value))
  newBody[rowIndex][cellIndex] = value
  body.value = newBody
  store.commitBlockChanges()
}

function addRow() {
  var cols = body.value[0] ? body.value[0].length : 2
  var newRow = new Array(cols).fill('')
  var newBody = JSON.parse(JSON.stringify(body.value))
  newBody.push(newRow)
  body.value = newBody
  store.commitBlockChanges()
}

function addColumn() {
  var newHead = JSON.parse(JSON.stringify(head.value))
  newHead.forEach(function (row) {
    row.push('')
  })
  head.value = newHead

  var newBody = JSON.parse(JSON.stringify(body.value))
  newBody.forEach(function (row) {
    row.push('')
  })
  body.value = newBody
  store.commitBlockChanges()
}

function deleteRow(index) {
  if (body.value.length <= 1) return
  var newBody = JSON.parse(JSON.stringify(body.value))
  newBody.splice(index, 1)
  body.value = newBody
  store.commitBlockChanges()
}

function deleteColumn(index) {
  if (head.value[0] && head.value[0].length <= 1) return

  var newHead = JSON.parse(JSON.stringify(head.value))
  newHead.forEach(function (row) {
    row.splice(index, 1)
  })
  head.value = newHead

  var newBody = JSON.parse(JSON.stringify(body.value))
  newBody.forEach(function (row) {
    row.splice(index, 1)
  })
  body.value = newBody
  store.commitBlockChanges()
}
</script>

<template>
  <figure class="wp-block-table">
    <div v-if="isSelected" class="table-toolbar">
      <button type="button" @click="addRow">+ 行</button>
      <button type="button" @click="addColumn">+ 列</button>
    </div>
    <table>
      <thead>
        <tr v-for="(row, rowIndex) in head" :key="'head-' + rowIndex">
          <th
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            contenteditable="true"
            @blur="updateHeadCell(rowIndex, cellIndex, $event.target.textContent)"
            v-text="cell"
          ></th>
          <th v-if="isSelected" class="action-cell">
            <button @click="deleteColumn(0)">×</button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in body" :key="'body-' + rowIndex">
          <td
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            contenteditable="true"
            @blur="updateBodyCell(rowIndex, cellIndex, $event.target.textContent)"
            v-text="cell"
          ></td>
          <td v-if="isSelected" class="action-cell">
            <button @click="deleteRow(rowIndex)">×</button>
          </td>
        </tr>
      </tbody>
    </table>
  </figure>
</template>

<style scoped>
.wp-block-table {
  margin: 0;
  overflow-x: auto;
}
.table-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.table-toolbar button {
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
}
.table-toolbar button:hover {
  background: #f0f0f0;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
  outline: none;
  min-width: 80px;
}
th {
  background: #f0f0f0;
  font-weight: 600;
}
td:empty::before {
  content: '输入内容';
  color: #999;
}
.action-cell {
  width: 30px;
  padding: 4px;
  text-align: center;
  background: #fff;
}
.action-cell button {
  width: 20px;
  height: 20px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}
.action-cell button:hover {
  background: #cc1818;
  color: #fff;
}
</style>
