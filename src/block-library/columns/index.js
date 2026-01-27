import { registerBlockType } from '../../blocks/index.js'
import ColumnsEdit from './Edit.vue'

registerBlockType('core/columns', {
  title: '柱子',
  icon: '▥',
  iconName: 'columns',
  category: 'design',
  keywords: ['列', 'columns', '多栏', '布局'],
  attributes: {
    columns: { type: 'number', default: 2 },
    content: { type: 'array', default: ['', ''] },
  },
  edit: ColumnsEdit,
  save: function (props) {
    var columns = props.attributes.columns
    var content = props.attributes.content

    var html = '<div class="wp-block-columns">'
    for (var i = 0; i < columns; i++) {
      html += '<div class="wp-block-column"><p>' + (content[i] || '') + '</p></div>'
    }
    html += '</div>'
    return html
  },
})
