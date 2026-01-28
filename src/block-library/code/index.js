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
    language: {
      type: 'string',
      default: 'auto',
    },
    theme: {
      type: 'string',
      default: 'dark',
    },
  },
  edit: CodeEdit,
  save: function (props) {
    var content = props.attributes.content
    var language = props.attributes.language || 'auto'
    var theme = props.attributes.theme || 'dark'

    if (!content) {
      return ''
    }

    var escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    var langClass = language && language !== 'auto' ? ' language-' + language : ''
    var themeClass = theme === 'light' ? ' is-light' : ' is-dark'

    return (
      '<pre class="wp-block-code' +
      themeClass +
      '"><code class="' +
      langClass.trim() +
      '">' +
      escaped +
      '</code></pre>'
    )
  },
})
