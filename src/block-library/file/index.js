import { registerBlockType } from '../../blocks/index.js'
import FileEdit from './Edit.vue'

registerBlockType('core/file', {
  title: '档案',
  icon: '▨',
  iconName: 'file',
  category: 'media',
  keywords: ['档案', 'file', '文件', '下载'],
  attributes: {
    href: { type: 'string', default: '' },
    fileName: { type: 'string', default: '' },
    showDownload: { type: 'boolean', default: true },
  },
  edit: FileEdit,
  save: function (props) {
    var href = props.attributes.href
    var fileName = props.attributes.fileName
    var showDownload = props.attributes.showDownload
    if (!href) return ''

    var html = '<div class="wp-block-file">'
    html += '<a href="' + href + '">' + fileName + '</a>'
    if (showDownload) {
      html += '<a href="' + href + '" class="wp-block-file__button" download>下载</a>'
    }
    html += '</div>'
    return html
  },
})
