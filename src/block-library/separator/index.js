import { registerBlockType } from '../../blocks/index.js'
import SeparatorEdit from './Edit.vue'

registerBlockType('core/separator', {
  title: '分隔符',
  icon: '—',
  iconName: 'separator',
  category: 'design',
  keywords: ['分隔符', 'separator', '横线', 'hr'],
  attributes: {
    style: { type: 'string', default: 'default' },
  },
  edit: SeparatorEdit,
  save: function (props) {
    var style = props.attributes.style
    return '<hr class="wp-block-separator is-style-' + style + '" />'
  },
})
