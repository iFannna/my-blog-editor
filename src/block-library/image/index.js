import { registerBlockType } from '../../blocks/index.js'
import ImageEdit from './Edit.vue'

registerBlockType('core/image', {
  title: '图片',
  icon: '◩',
  iconName: 'image',
  category: 'media',
  keywords: ['图片', 'image', '照片', 'photo'],
  attributes: {
    url: { type: 'string', default: '' },
    alt: { type: 'string', default: '' },
    caption: { type: 'string', default: '' },
    width: { type: 'string', default: '' },
    height: { type: 'string', default: '' },
    align: { type: 'string', default: 'none' },
    href: { type: 'string', default: '' },
    linkTarget: { type: 'string', default: '' },
  },
  edit: ImageEdit,
  save: function (props) {
    var url = props.attributes.url
    var alt = props.attributes.alt || ''
    var caption = props.attributes.caption
    var width = props.attributes.width
    var height = props.attributes.height
    var align = props.attributes.align
    var href = props.attributes.href
    var linkTarget = props.attributes.linkTarget

    if (!url) return ''

    var classes = ['wp-block-image']
    if (align && align !== 'none') classes.push('align' + align)
    if (width || height) classes.push('is-resized')

    var styleAttr = ''
    var styles = []
    if (width) styles.push('width:' + width)
    if (height) styles.push('height:' + height)
    if (styles.length) styleAttr = ' style="' + styles.join(';') + '"'

    var img = '<img src="' + url + '" alt="' + alt + '"' + styleAttr + ' />'

    if (href) {
      var target = linkTarget ? ' target="' + linkTarget + '"' : ''
      var rel = linkTarget === '_blank' ? ' rel="noopener noreferrer"' : ''
      img = '<a href="' + href + '"' + target + rel + '>' + img + '</a>'
    }

    var html = '<figure class="' + classes.join(' ') + '">'
    html += img
    if (caption) {
      html += '<figcaption class="wp-element-caption">' + caption + '</figcaption>'
    }
    html += '</figure>'

    return html
  },
})
