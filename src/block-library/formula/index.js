import { registerBlockType } from '../../blocks/index.js'
import FormulaEdit from './Edit.vue'

registerBlockType('core/formula', {
  title: '数学',
  icon: '√',
  iconName: 'formula',
  category: 'text',
  keywords: ['数学', 'math', 'formula', '公式', 'latex', 'katex'],
  attributes: {
    content: { type: 'string', default: '' },
    displayMode: { type: 'boolean', default: true },
  },
  edit: FormulaEdit,
  save: function (props) {
    var content = props.attributes.content
    var displayMode = props.attributes.displayMode
    if (!content) return ''

    var className = displayMode ? 'wp-block-formula is-display' : 'wp-block-formula'
    return (
      '<div class="' +
      className +
      '" data-formula="' +
      encodeURIComponent(content) +
      '">' +
      content +
      '</div>'
    )
  },
})
