/**
 * 设置高亮颜色 - 移植自 Gutenberg format-library/src/text-color/inline.js
 */

import { applyFormat } from './applyFormat.js'
import { removeFormat } from './removeFormat.js'
import { getActiveFormats } from './getActiveFormats.js'

export var transparentValue = 'rgba(0, 0, 0, 0)'

// 解析 CSS style 字符串
function parseCSS(css) {
  if (!css) return {}

  return css.split(';').reduce(function (acc, rule) {
    if (rule) {
      var parts = rule.split(':')
      var property = parts[0] ? parts[0].trim() : ''
      var val = parts[1] ? parts[1].trim() : ''

      if (property === 'color') {
        acc.color = val
      }
      if (property === 'background-color' && val !== transparentValue) {
        acc.backgroundColor = val
      }
    }
    return acc
  }, {})
}

// 获取当前激活的颜色
export function getActiveColors(value) {
  var formats = getActiveFormats(value)
  var highlightFormat = formats.find(function (f) {
    return f.type === 'highlight'
  })

  if (!highlightFormat || !highlightFormat.attributes) {
    return {}
  }

  return parseCSS(highlightFormat.attributes.style)
}

// 设置颜色并返回新的 value
export function setColors(value, colors) {
  var currentColors = getActiveColors(value)
  var newColors = Object.assign({}, currentColors, colors)

  var color = newColors.color
  var backgroundColor = newColors.backgroundColor

  // 如果没有任何颜色，移除格式
  if (!color && !backgroundColor) {
    return removeFormat(value, 'highlight')
  }

  // 构建 style 字符串
  var styles = []

  if (backgroundColor) {
    styles.push('background-color:' + backgroundColor)
  } else {
    // 默认透明背景，覆盖浏览器的 mark 默认黄色
    styles.push('background-color:' + transparentValue)
  }

  if (color) {
    styles.push('color:' + color)
  }

  var attributes = {
    style: styles.join(';'),
    class: 'has-inline-color',
  }

  return applyFormat(value, { type: 'highlight', attributes: attributes })
}
