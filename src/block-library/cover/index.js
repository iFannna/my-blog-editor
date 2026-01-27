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
    overlayColor: { type: 'string', default: 'rgba(0,0,0,0.5)' },
    title: { type: 'string', default: '' },
    minHeight: { type: 'number', default: 300 },
  },
  edit: CoverEdit,
  save: function (props) {
    var url = props.attributes.url
    var overlayColor = props.attributes.overlayColor
    var title = props.attributes.title
    var minHeight = props.attributes.minHeight

    var style = 'min-height:' + minHeight + 'px;'
    if (url) {
      style += 'background-image:url(' + url + ');'
    }

    var html = '<div class="wp-block-cover" style="' + style + '">'
    html +=
      '<span class="wp-block-cover__background" style="background:' + overlayColor + '"></span>'
    html += '<div class="wp-block-cover__inner-container">'
    if (title) {
      html += '<p class="has-text-align-center">' + title + '</p>'
    }
    html += '</div></div>'
    return html
  },
})
