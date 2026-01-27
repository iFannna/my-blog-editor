import { registerBlockType } from '../../blocks/index.js'
import ParagraphEdit from './Edit.vue'

registerBlockType('core/paragraph', {
  title: '段落',
  icon: '¶',
  iconName: 'paragraph',
  category: 'text',
  keywords: ['文本', 'text'],
  attributes: {
    content: {
      type: 'string',
      default: '',
      source: 'html',
      selector: 'p',
    },
    textAlign: {
      type: 'string',
      default: 'left',
    },
  },
  edit: ParagraphEdit,
  save: function (props) {
    var content = props.attributes.content
    var textAlign = props.attributes.textAlign
    if (!content) {
      return ''
    }
    var style = textAlign && textAlign !== 'left' ? ' style="text-align:' + textAlign + '"' : ''
    return '<p class="wp-block-paragraph"' + style + '>' + content + '</p>'
  },
})
