/**
 * RichTextValue → HTML
 * 移植自 Gutenberg
 */

const FORMAT_TO_TAG = {
  bold: 'strong',
  italic: 'em',
  strikethrough: 's',
  code: 'code',
  link: 'a',
  highlight: 'mark',
}

function escapeHTML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function isSameFormat(a, b) {
  return a.type === b.type && JSON.stringify(a.attributes) === JSON.stringify(b.attributes)
}

function getOpeningTag(format) {
  const tag = FORMAT_TO_TAG[format.type] || 'span'

  if (format.type === 'link' && format.attributes && format.attributes.href) {
    const href = escapeHTML(format.attributes.href)
    const target = format.attributes.target
      ? ' target="' + escapeHTML(format.attributes.target) + '"'
      : ''
    return '<' + tag + ' href="' + href + '"' + target + '>'
  }

  // 高亮格式 - 参照 Gutenberg 的 text-color 格式
  // 不自动添加任何背景色，只使用用户设置的颜色
  if (format.type === 'highlight' && format.attributes) {
    const attrs = format.attributes
    let styleStr = ''
    let classStr = 'has-inline-color'

    // 只有当用户明确设置了背景色时才添加
    if (
      attrs.backgroundColor &&
      attrs.backgroundColor !== 'transparent' &&
      attrs.backgroundColor !== 'rgba(0, 0, 0, 0)'
    ) {
      styleStr += 'background-color:' + attrs.backgroundColor + ';'
    } else {
      // 如果没有设置背景色，使用透明背景
      styleStr += 'background-color:rgba(0, 0, 0, 0);'
    }

    if (attrs.color) {
      styleStr += 'color:' + attrs.color
    }

    if (attrs.className) {
      classStr = attrs.className
    }

    const styleAttr = styleStr ? ' style="' + styleStr + '"' : ''
    const classAttr = classStr ? ' class="' + classStr + '"' : ''

    return '<' + tag + styleAttr + classAttr + '>'
  }

  return '<' + tag + '>'
}

function getClosingTag(format) {
  const tag = FORMAT_TO_TAG[format.type] || 'span'
  return '</' + tag + '>'
}

export function toHtmlString({ value }) {
  const { text, formats, replacements } = value

  if (text.length === 0) {
    return ''
  }

  let html = ''
  let openFormats = []

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const charFormats = formats[i] || []
    const replacement = replacements ? replacements[i] : undefined

    // 找出需要关闭的格式
    const formatsToClose = openFormats.filter(function (f) {
      return !charFormats.some(function (cf) {
        return isSameFormat(f, cf)
      })
    })

    // 找出需要打开的格式
    const formatsToOpen = charFormats.filter(function (f) {
      return !openFormats.some(function (of) {
        return isSameFormat(f, of)
      })
    })

    // 如果有格式需要关闭，先全部关闭再重新打开需要保留的
    if (formatsToClose.length > 0) {
      for (let j = openFormats.length - 1; j >= 0; j--) {
        html += getClosingTag(openFormats[j])
      }
      openFormats = openFormats.filter(function (f) {
        return !formatsToClose.some(function (cf) {
          return isSameFormat(f, cf)
        })
      })
      for (let k = 0; k < openFormats.length; k++) {
        html += getOpeningTag(openFormats[k])
      }
    }

    // 打开新格式
    for (let m = 0; m < formatsToOpen.length; m++) {
      html += getOpeningTag(formatsToOpen[m])
      openFormats.push(formatsToOpen[m])
    }

    // 处理替换对象（如行内图片）
    if (replacement && replacement.type === 'image') {
      const src = replacement.attributes.src || ''
      const alt = replacement.attributes.alt || ''
      html +=
        '<img src="' +
        escapeHTML(src) +
        '" alt="' +
        escapeHTML(alt) +
        '" class="inline-image" style="max-height:1.5em;vertical-align:middle;" />'
      continue
    }

    // 输出字符
    if (char === '\n') {
      html += '<br>'
    } else if (char !== '\uFFFC') {
      html += escapeHTML(char)
    }
  }

  // 关闭所有剩余格式
  for (let n = openFormats.length - 1; n >= 0; n--) {
    html += getClosingTag(openFormats[n])
  }

  return html
}
