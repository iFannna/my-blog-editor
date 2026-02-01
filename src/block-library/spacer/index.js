import { registerBlockType } from '../../blocks/index.js'
import SpacerEdit from './Edit.vue'

registerBlockType('core/spacer', {
  title: '间隔',
  icon: '↕',
  iconName: 'spacer',
  category: 'design',
  keywords: ['间隔', 'spacer', '空白', '留白', '距离'],
  attributes: {
    height: {
      type: 'string',
      default: '100px',
    },
  },
  edit: SpacerEdit,
  save: function (props) {
    var height = props.attributes.height || '100px'
    return '<div style="height:' + height + '" aria-hidden="true" class="wp-block-spacer"></div>'
  },
})
