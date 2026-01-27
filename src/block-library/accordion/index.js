import { registerBlockType } from '../../blocks/index.js'
import AccordionEdit from './Edit.vue'

registerBlockType('core/accordion', {
  title: '手风琴',
  icon: '▼',
  iconName: 'accordion',
  category: 'design',
  keywords: ['手风琴', 'accordion', '折叠', 'FAQ'],
  attributes: {
    items: {
      type: 'array',
      default: [{ title: '标题', content: '内容' }],
    },
  },
  edit: AccordionEdit,
  save: function (props) {
    var items = props.attributes.items
    if (!items || items.length === 0) return ''

    var html = '<div class="wp-block-accordion">'
    items.forEach(function (item) {
      html += '<details class="accordion-item">'
      html += '<summary>' + item.title + '</summary>'
      html += '<div class="accordion-content"><p>' + item.content + '</p></div>'
      html += '</details>'
    })
    html += '</div>'
    return html
  },
})
