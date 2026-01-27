/**
 * 从选区移除格式
 */

export function removeFormat(value, formatType, startIndex, endIndex) {
  const { text, formats, replacements, start, end } = value

  const actualStart = startIndex !== undefined ? startIndex : start !== undefined ? start : 0
  const actualEnd = endIndex !== undefined ? endIndex : end !== undefined ? end : text.length

  const newFormats = formats.slice()

  for (let i = actualStart; i < actualEnd; i++) {
    const currentFormats = newFormats[i]
    if (!currentFormats) {
      continue
    }

    const filtered = currentFormats.filter(function (f) {
      return f.type !== formatType
    })

    newFormats[i] = filtered.length > 0 ? filtered : undefined
  }

  return {
    text: text,
    formats: newFormats,
    replacements: replacements,
    start: start,
    end: end,
  }
}
