import { registerBlockType } from '../../blocks/index.js'
import GalleryEdit from './Edit.vue'

registerBlockType('core/gallery', {
  title: '画廊',
  icon: '◩',
  iconName: 'gallery',
  category: 'media',
  keywords: ['画廊', 'gallery', '图集', '相册'],
  attributes: {
    images: { type: 'array', default: [] },
    columns: { type: 'number', default: 3 },
  },
  edit: GalleryEdit,
  save: function (props) {
    var images = props.attributes.images
    var columns = props.attributes.columns
    if (!images || images.length === 0) return ''

    var html = '<figure class="wp-block-gallery columns-' + columns + '">'
    images.forEach(function (img) {
      html +=
        '<figure class="wp-block-image"><img src="' +
        img.url +
        '" alt="' +
        (img.alt || '') +
        '" /></figure>'
    })
    html += '</figure>'
    return html
  },
})
