import { registerBlockType } from '../../blocks/index.js'
import MediaTextEdit from './Edit.vue'

registerBlockType('core/media-text', {
  title: '媒体与文本',
  icon: '▣',
  iconName: 'mediaText',
  category: 'media',
  keywords: ['媒体', '文本', 'media', 'text'],
  attributes: {
    mediaUrl: { type: 'string', default: '' },
    mediaType: { type: 'string', default: 'image' },
    mediaPosition: { type: 'string', default: 'left' },
    content: { type: 'string', default: '' },
  },
  edit: MediaTextEdit,
  save: function (props) {
    var mediaUrl = props.attributes.mediaUrl
    var mediaPosition = props.attributes.mediaPosition
    var content = props.attributes.content

    var html = '<div class="wp-block-media-text is-media-' + mediaPosition + '">'
    html += '<figure class="wp-block-media-text__media">'
    html += '<img src="' + mediaUrl + '" />'
    html += '</figure>'
    html += '<div class="wp-block-media-text__content"><p>' + content + '</p></div>'
    html += '</div>'
    return html
  },
})
