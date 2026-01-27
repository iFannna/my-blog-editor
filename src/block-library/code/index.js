import { registerBlockType } from '../../blocks/index.js'
import CodeEdit from './Edit.vue'

registerBlockType('core/code', {
  title: '代码',
  icon: '</>',
  iconName: 'code',
  category: 'text',
  keywords: ['代码', 'code', '程序'],
  attributes: {
    content: {
      type: 'string',
      default: '',
      source: 'text',
      selector: 'code',
    },
  },
  edit: CodeEdit,
  save: function (props) {
    var content = props.attributes.content

    if (!content) {
      return ''
    }

    var escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    return '<pre class="wp-block-code"><code>' + escaped + '</code></pre>'
  },
})
