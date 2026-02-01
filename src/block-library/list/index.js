import { registerBlockType } from '../../blocks/index.js'
import ListEdit from './Edit.vue'

registerBlockType('core/list', {
  title: '列表',
  icon: '•',
  iconName: 'list',
  category: 'text',
  keywords: ['列表', 'list', '项目', 'ul', 'ol'],
  attributes: {
    ordered: {
      type: 'boolean',
      default: false,
    },
    values: {
      type: 'string',
      default: '',
    },
  },
  edit: ListEdit,
  save: function (props) {
    var ordered = props.attributes.ordered
    var values = props.attributes.values
    if (!values) return ''
    var tag = ordered ? 'ol' : 'ul'
    // values 已经是包含 <li> 标签和富文本格式的 HTML
    return '<' + tag + ' class="wp-block-list">' + values + '</' + tag + '>'
  },
})
