import { registerBlockType } from '../../blocks/index.js'
import AudioEdit from './Edit.vue'

registerBlockType('core/audio', {
  title: '音频',
  icon: '₰',
  iconName: 'audio',
  category: 'media',
  keywords: ['音频', 'audio', '音乐', 'mp3'],
  attributes: {
    src: { type: 'string', default: '' },
    caption: { type: 'string', default: '' },
  },
  edit: AudioEdit,
  save: function (props) {
    var src = props.attributes.src
    var caption = props.attributes.caption
    if (!src) return ''
    var html = '<figure class="wp-block-audio">'
    html += '<audio controls src="' + src + '"></audio>'
    if (caption) {
      html += '<figcaption>' + caption + '</figcaption>'
    }
    html += '</figure>'
    return html
  },
})
