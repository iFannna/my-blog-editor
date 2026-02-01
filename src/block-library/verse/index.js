import { registerBlockType } from '../../blocks/index.js'
import VerseEdit from './Edit.vue'

registerBlockType('core/verse', {
  title: '诗歌',
  icon: '௹',
  iconName: 'verse',
  category: 'text',
  keywords: ['诗歌', 'verse', '预格式化', '诗'],
  attributes: {
    content: { type: 'string', default: '' },
  },
  edit: VerseEdit,
  save: function (props) {
    var content = props.attributes.content
    if (!content) return ''
    // content 已经包含富文本格式的 HTML
    return '<pre class="wp-block-verse">' + content + '</pre>'
  },
})
