import { registerBlockType } from '../../blocks/index.js'
import DetailsEdit from './Edit.vue'

registerBlockType('core/details', {
  title: '详细',
  icon: '▶',
  iconName: 'details',
  category: 'text',
  keywords: ['详细', 'details', '折叠', '展开'],
  attributes: {
    summary: { type: 'string', default: '详细信息' },
    content: { type: 'string', default: '' },
  },
  edit: DetailsEdit,
  save: function (props) {
    var summary = props.attributes.summary
    var content = props.attributes.content
    // summary 和 content 已经包含富文本格式的 HTML
    return (
      '<details class="wp-block-details"><summary>' +
      summary +
      '</summary><p>' +
      content +
      '</p></details>'
    )
  },
})
