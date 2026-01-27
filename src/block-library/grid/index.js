import { registerBlockType } from '../../blocks/index.js'
import GridEdit from './Edit.vue'

registerBlockType('core/grid', {
  title: '网格',
  icon: '▦',
  iconName: 'grid',
  category: 'design',
  keywords: ['网格', 'grid', '布局'],
  attributes: {
    rows: { type: 'number', default: 2 },
    cols: { type: 'number', default: 2 },
    cells: {
      type: 'array',
      default: [
        ['', ''],
        ['', ''],
      ],
    },
  },
  edit: GridEdit,
  save: function (props) {
    var rows = props.attributes.rows
    var cols = props.attributes.cols
    var cells = props.attributes.cells

    var html = '<div class="wp-block-grid" style="grid-template-columns:repeat(' + cols + ',1fr)">'
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        html +=
          '<div class="wp-block-grid__cell"><p>' + ((cells[i] && cells[i][j]) || '') + '</p></div>'
      }
    }
    html += '</div>'
    return html
  },
})
