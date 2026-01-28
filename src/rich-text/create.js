/**
 * HTML → RichTextValue
 * 移植自 Gutenberg
 */

const FORMAT_TAG_MAP = {
  strong: 'bold',
  b: 'bold',
  em: 'italic',
  i: 'italic',
  s: 'strikethrough',
  del: 'strikethrough',
  code: 'code',
  a: 'link',
  mark: 'highlight',
}

export function createEmptyValue() {
  return {
    text: '',
    formats: [],
    replacements: [],
    start: undefined,
    end: undefined,
  }
}

export function create({ html, text, element } = {}) {
  if (typeof text === 'string') {
    return {
      text,
      formats: Array(text.length),
      replacements: Array(text.length),
    }
  }

  if (typeof html === 'string') {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    element = doc.body
  }

  if (!element) {
    return createEmptyValue()
  }

  return createFromElement(element, [])
}

function createFromElement(element, inheritedFormats) {
  const accumulator = createEmptyValue()

  const childNodes = Array.from(element.childNodes)

  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i]

    // 文本节点
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      const startIndex = accumulator.text.length

      accumulator.text += text

      for (let j = 0; j < text.length; j++) {
        accumulator.formats[startIndex + j] =
          inheritedFormats.length > 0 ? [...inheritedFormats] : undefined
        accumulator.replacements[startIndex + j] = undefined
      }
      continue
    }

    // 元素节点
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node
      const tagName = el.tagName.toLowerCase()

      // 换行标签
      if (tagName === 'br') {
        const startIndex = accumulator.text.length
        accumulator.text += '\n'
        accumulator.formats[startIndex] =
          inheritedFormats.length > 0 ? [...inheritedFormats] : undefined
        accumulator.replacements[startIndex] = undefined
        continue
      }

      // 行内图片
      if (tagName === 'img') {
        const startIndex = accumulator.text.length
        accumulator.text += '\uFFFC' // 对象替换字符
        accumulator.formats[startIndex] =
          inheritedFormats.length > 0 ? [...inheritedFormats] : undefined
        accumulator.replacements[startIndex] = {
          type: 'image',
          attributes: {
            src: el.getAttribute('src') || '',
            alt: el.getAttribute('alt') || '',
          },
        }
        continue
      }

      // 检查是否是格式标签
      const formatType = FORMAT_TAG_MAP[tagName]
      const newFormats = [...inheritedFormats]

      if (formatType) {
        const format = { type: formatType }

        // 处理链接属性
        if (formatType === 'link') {
          format.attributes = {
            href: el.getAttribute('href') || '',
          }
          const target = el.getAttribute('target')
          if (target) {
            format.attributes.target = target
          }
        }

        // 处理高亮属性（mark 标签）
        if (formatType === 'highlight') {
          format.attributes = {}
          const style = el.getAttribute('style')
          if (style) {
            // 解析 style 属性
            const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/)
            const bgMatch = style.match(/background-color\s*:\s*([^;]+)/)
            if (colorMatch) {
              format.attributes.color = colorMatch[1].trim()
            }
            if (bgMatch) {
              format.attributes.backgroundColor = bgMatch[1].trim()
            }
          }
          const className = el.getAttribute('class')
          if (className) {
            format.attributes.className = className
          }
        }

        newFormats.push(format)
      }

      // 递归处理子元素
      const childValue = createFromElement(el, newFormats)
      const startIndex = accumulator.text.length

      accumulator.text += childValue.text

      for (let j = 0; j < childValue.text.length; j++) {
        accumulator.formats[startIndex + j] = childValue.formats[j]
        accumulator.replacements[startIndex + j] = childValue.replacements[j]
      }
    }
  }

  return accumulator
}
