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

  return '<' + tag + '>'
}

function getClosingTag(format) {
  const tag = FORMAT_TO_TAG[format.type] || 'span'
  return '</' + tag + '>'
}

export function toHtmlString({ value }) {
  const { text, formats } = value

  if (text.length === 0) {
    return ''
  }

  let html = ''
  let openFormats = []

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const charFormats = formats[i] || []

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

    // 输出字符
    if (char === '\n') {
      html += '<br>'
    } else {
      html += escapeHTML(char)
    }
  }

  // 关闭所有剩余格式
  for (let n = openFormats.length - 1; n >= 0; n--) {
    html += getClosingTag(openFormats[n])
  }

  return html
}
