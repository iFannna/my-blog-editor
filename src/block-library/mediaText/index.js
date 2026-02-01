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
    mediaAlt: { type: 'string', default: '' },
    mediaWidth: { type: 'number', default: 50 },
    isStackedOnMobile: { type: 'boolean', default: true },
    content: { type: 'string', default: '' },
  },
  edit: MediaTextEdit,
  save: function (props) {
    var mediaUrl = props.attributes.mediaUrl
    var mediaType = props.attributes.mediaType || 'image'
    var mediaPosition = props.attributes.mediaPosition || 'left'
    var mediaAlt = props.attributes.mediaAlt || ''
    var mediaWidth = props.attributes.mediaWidth || 50
    var isStackedOnMobile = props.attributes.isStackedOnMobile !== false
    var content = props.attributes.content || ''

    // 构建类名
    var classNames = ['wp-block-media-text']
    if (mediaPosition === 'right') {
      classNames.push('has-media-on-the-right')
    }
    if (isStackedOnMobile) {
      classNames.push('is-stacked-on-mobile')
    }

    // 构建 gridTemplateColumns 样式
    var style = ''
    if (mediaWidth !== 50) {
      var gridTemplateColumns =
        mediaPosition === 'right' ? 'auto ' + mediaWidth + '%' : mediaWidth + '% auto'
      style = ' style="grid-template-columns:' + gridTemplateColumns + '"'
    }

    // 构建媒体元素
    var mediaHtml = ''
    if (mediaUrl) {
      if (mediaType === 'video') {
        mediaHtml = '<video controls src="' + mediaUrl + '"></video>'
      } else {
        mediaHtml = '<img src="' + mediaUrl + '" alt="' + mediaAlt + '"/>'
      }
    }

    // 媒体区域
    var figureHtml = '<figure class="wp-block-media-text__media">' + mediaHtml + '</figure>'

    // 内容区域 - 不再强制包裹 <p>，因为 content 可能已包含 HTML
    var contentHtml = '<div class="wp-block-media-text__content">' + content + '</div>'

    // 根据媒体位置决定顺序
    var innerHtml = ''
    if (mediaPosition === 'right') {
      innerHtml = contentHtml + figureHtml
    } else {
      innerHtml = figureHtml + contentHtml
    }

    return '<div class="' + classNames.join(' ') + '"' + style + '>' + innerHtml + '</div>'
  },
})
