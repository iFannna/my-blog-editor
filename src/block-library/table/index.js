import { registerBlockType } from '../../blocks/index.js'
import TableEdit from './Edit.vue'

registerBlockType('core/table', {
  title: '表格',
  icon: '▦',
  iconName: 'table',
  category: 'text',
  keywords: ['表格', 'table', '数据'],
  attributes: {
    head: { type: 'array', default: [['标题1', '标题2']] },
    body: { type: 'array', default: [['', '']] },
  },
  edit: TableEdit,
  save: function (props) {
    var head = props.attributes.head
    var body = props.attributes.body

    var html = '<figure class="wp-block-table"><table>'

    if (head && head.length > 0) {
      html += '<thead>'
      head.forEach(function (row) {
        html += '<tr>'
        row.forEach(function (cell) {
          html += '<th>' + cell + '</th>'
        })
        html += '</tr>'
      })
      html += '</thead>'
    }

    if (body && body.length > 0) {
      html += '<tbody>'
      body.forEach(function (row) {
        html += '<tr>'
        row.forEach(function (cell) {
          html += '<td>' + cell + '</td>'
        })
        html += '</tr>'
      })
      html += '</tbody>'
    }

    html += '</table></figure>'
    return html
  },
})
