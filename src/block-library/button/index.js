import { registerBlockType } from '../../blocks/index.js'
import ButtonEdit from './Edit.vue'

registerBlockType('core/button', {
  title: '按钮',
  icon: '▢',
  iconName: 'button',
  category: 'design',
  keywords: ['按钮', 'button', '链接', 'link'],
  attributes: {
    text: { type: 'string', default: '按钮' },
    url: { type: 'string', default: '' },
    backgroundColor: { type: 'string', default: '#1e1e1e' },
    textColor: { type: 'string', default: '#ffffff' },
  },
  edit: ButtonEdit,
  save: function (props) {
    var text = props.attributes.text
    var url = props.attributes.url || '#'
    var backgroundColor = props.attributes.backgroundColor
    var textColor = props.attributes.textColor

    var style = 'background-color:' + backgroundColor + ';color:' + textColor + ';'
    return (
      '<div class="wp-block-button"><a class="wp-block-button__link" href="' +
      url +
      '" style="' +
      style +
      '">' +
      text +
      '</a></div>'
    )
  },
})
