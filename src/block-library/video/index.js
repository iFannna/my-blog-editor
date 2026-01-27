import { registerBlockType } from '../../blocks/index.js'
import VideoEdit from './Edit.vue'

registerBlockType('core/video', {
  title: '视频',
  icon: '◪',
  iconName: 'video',
  category: 'media',
  keywords: ['视频', 'video', '影片', 'mp4'],
  attributes: {
    src: { type: 'string', default: '' },
    caption: { type: 'string', default: '' },
    poster: { type: 'string', default: '' },
  },
  edit: VideoEdit,
  save: function (props) {
    var src = props.attributes.src
    var caption = props.attributes.caption
    var poster = props.attributes.poster
    if (!src) return ''

    var html = '<figure class="wp-block-video">'
    html += '<video controls src="' + src + '"'
    if (poster) html += ' poster="' + poster + '"'
    html += '></video>'
    if (caption) html += '<figcaption>' + caption + '</figcaption>'
    html += '</figure>'
    return html
  },
})
