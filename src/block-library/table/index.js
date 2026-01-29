import { registerBlockType } from '../../blocks/index.js'
import TableEdit from './Edit.vue'

registerBlockType('core/table', {
  title: '表格',
  icon: '▦',
  iconName: 'table',
  category: 'text',
  keywords: ['表格', 'table', '数据'],
  attributes: {
    head: { type: 'array', default: [] },
    body: { type: 'array', default: [] },
  },
  edit: TableEdit,
  save: function (props) {
    var head = props.attributes.head
    var body = props.attributes.body

    if ((!body || body.length === 0) && (!head || head.length === 0)) {
      return ''
    }

    var html = '<figure class="wp-block-table"><table class="has-fixed-layout">'

    if (head && head.length > 0) {
      html += '<thead>'
      head.forEach(function (row) {
        html += '<tr>'
        row.cells.forEach(function (cell) {
          var align = cell.align ? ' style="text-align:' + cell.align + '"' : ''
          html += '<th' + align + '>' + (cell.content || '') + '</th>'
        })
        html += '</tr>'
      })
      html += '</thead>'
    }

    if (body && body.length > 0) {
      html += '<tbody>'
      body.forEach(function (row) {
        html += '<tr>'
        row.cells.forEach(function (cell) {
          var align = cell.align ? ' style="text-align:' + cell.align + '"' : ''
          html += '<td' + align + '>' + (cell.content || '') + '</td>'
        })
        html += '</tr>'
      })
      html += '</tbody>'
    }

    html += '</table></figure>'
    return html
  },
})
