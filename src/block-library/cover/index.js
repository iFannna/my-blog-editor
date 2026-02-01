import { registerBlockType } from '../../blocks/index.js'
import CoverEdit from './Edit.vue'

registerBlockType('core/cover', {
  title: '封面',
  icon: '▣',
  iconName: 'cover',
  category: 'media',
  keywords: ['封面', 'cover', '背景', '横幅'],
  attributes: {
    url: { type: 'string', default: '' },
    backgroundColor: { type: 'string', default: '' },
    title: { type: 'string', default: '' },
    minHeight: { type: 'number', default: 300 },
    textAlign: { type: 'string', default: 'center' },
  },
  edit: CoverEdit,
  save: function (props) {
    var url = props.attributes.url
    var backgroundColor = props.attributes.backgroundColor
    var title = props.attributes.title
    var minHeight = props.attributes.minHeight
    var textAlign = props.attributes.textAlign || 'center'

    if (!url && !backgroundColor) {
      return ''
    }

    var style = 'min-height:' + minHeight + 'px;'
    if (url) {
      style += 'background-image:url(' + url + ');background-size:cover;background-position:center;'
    } else if (backgroundColor) {
      style += 'background-color:' + backgroundColor + ';'
    }

    var html = '<div class="wp-block-cover" style="' + style + '">'
    html += '<div class="wp-block-cover__inner-container">'
    if (title) {
      html += '<p class="has-text-align-' + textAlign + '">' + title + '</p>'
    }
    html += '</div></div>'
    return html
  },
})
