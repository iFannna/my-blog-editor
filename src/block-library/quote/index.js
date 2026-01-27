import { registerBlockType } from '../../blocks/index.js'
import QuoteEdit from './Edit.vue'

registerBlockType('core/quote', {
  title: '引用',
  icon: '"',
  iconName: 'quote',
  category: 'text',
  keywords: ['引用', 'quote', '引述', 'blockquote'],
  attributes: {
    content: { type: 'string', default: '' },
    citation: { type: 'string', default: '' },
  },
  edit: QuoteEdit,
  save: function (props) {
    var content = props.attributes.content
    var citation = props.attributes.citation
    if (!content) return ''
    var html = '<blockquote class="wp-block-quote"><p>' + content + '</p>'
    if (citation) {
      html += '<cite>' + citation + '</cite>'
    }
    html += '</blockquote>'
    return html
  },
})
