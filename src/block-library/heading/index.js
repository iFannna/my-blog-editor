import { registerBlockType } from '../../blocks/index.js'
import HeadingEdit from './Edit.vue'

registerBlockType('core/heading', {
  title: '标题',
  icon: 'H',
  iconName: 'heading',
  category: 'text',
  attributes: {
    content: { type: 'string', default: '', source: 'html' },
    level: { type: 'number', default: 2 },
    textAlign: { type: 'string', default: 'left' },
  },
  edit: HeadingEdit,
  save: function (props) {
    var content = props.attributes.content
    var level = props.attributes.level || 2
    var textAlign = props.attributes.textAlign
    var style = textAlign && textAlign !== 'left' ? ' style="text-align:' + textAlign + '"' : ''
    return `<h${level} class="wp-block-heading"${style}>${content || ''}</h${level}>`
  },
})
