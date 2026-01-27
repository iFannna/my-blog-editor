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

const rows = computed({
  get: function () {
    return props.attributes.rows || 2
  },
  set: function (val) {
    updateGrid(val, cols.value)
  },
})

const cols = computed({
  get: function () {
    return props.attributes.cols || 2
  },
  set: function (val) {
    updateGrid(rows.value, val)
  },
})

const cells = computed({
  get: function () {
    return (
      props.attributes.cells || [
        ['', ''],
        ['', ''],
      ]
    )
  },
  set: function (val) {
    emit('update:attributes', { cells: val })
  },
})

// 将二维数组展平为一维用于渲染
const flatCells = computed(function () {
  var result = []
  var cellData = cells.value
  for (var i = 0; i < rows.value; i++) {
    for (var j = 0; j < cols.value; j++) {
      result.push({
        rowIndex: i,
        colIndex: j,
        value: (cellData[i] && cellData[i][j]) || '',
      })
    }
  }
  return result
})

function updateGrid(newRows, newCols) {
  var newCells = []
  var oldCells = cells.value
  for (var i = 0; i < newRows; i++) {
    var row = []
    for (var j = 0; j < newCols; j++) {
      row.push((oldCells[i] && oldCells[i][j]) || '')
    }
    newCells.push(row)
  }
  emit('update:attributes', { rows: newRows, cols: newCols, cells: newCells })
  store.commitBlockChanges()
}

function updateCell(rowIndex, colIndex, value) {
  var newCells = JSON.parse(JSON.stringify(cells.value))
  if (!newCells[rowIndex]) {
    newCells[rowIndex] = []
  }
  newCells[rowIndex][colIndex] = value
  cells.value = newCells
  store.commitBlockChanges()
}
</script>

<template>
  <div class="wp-block-grid-wrapper">
    <div v-if="isSelected" class="grid-toolbar">
      <label>行: <input type="number" v-model.number="rows" min="1" max="6" /></label>
      <label>列: <input type="number" v-model.number="cols" min="1" max="6" /></label>
    </div>

    <div class="wp-block-grid" :style="{ gridTemplateColumns: 'repeat(' + cols + ', 1fr)' }">
      <div
        v-for="cell in flatCells"
        :key="cell.rowIndex + '-' + cell.colIndex"
        class="wp-block-grid__cell"
      >
        <p
          contenteditable="true"
          data-placeholder="内容"
          @blur="updateCell(cell.rowIndex, cell.colIndex, $event.target.textContent)"
        >
          {{ cell.value }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
}
.grid-toolbar label {
  display: flex;
  align-items: center;
  gap: 4px;
}
.grid-toolbar input {
  width: 50px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.wp-block-grid {
  display: grid;
  gap: 8px;
}
.wp-block-grid__cell {
  padding: 16px;
  background: #f0f0f0;
  border-radius: 4px;
  min-height: 80px;
}
.wp-block-grid__cell p {
  margin: 0;
  outline: none;
  min-height: 1.5em;
}
.wp-block-grid__cell p:empty::before {
  content: attr(data-placeholder);
  color: #949494;
}
</style>
