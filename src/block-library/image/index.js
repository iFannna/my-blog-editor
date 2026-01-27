import { registerBlockType } from '../../blocks/index.js'
import ImageEdit from './Edit.vue'

registerBlockType('core/image', {
  title: '图片',
  icon: '◩',
  iconName: 'image',
  category: 'media',
  keywords: ['图片', 'image', '照片', 'photo'],
  attributes: {
    url: {
      type: 'string',
      default: '',
    },
    alt: {
      type: 'string',
      default: '',
    },
    caption: {
      type: 'string',
      default: '',
    },
  },
  edit: ImageEdit,
  save: function (props) {
    var url = props.attributes.url
    var alt = props.attributes.alt || ''
    var caption = props.attributes.caption

    if (!url) {
      return ''
    }

    var html = '<figure class="wp-block-image">'
    html += '<img src="' + url + '" alt="' + alt + '" />'
    if (caption) {
      html += '<figcaption>' + caption + '</figcaption>'
    }
    html += '</figure>'

    return html
  },
})
