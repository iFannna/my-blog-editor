/**
 * 应用格式到选区
 */

export function applyFormat(value, format, startIndex, endIndex) {
  const { text, formats, replacements, start, end } = value

  const actualStart = startIndex !== undefined ? startIndex : start !== undefined ? start : 0
  const actualEnd = endIndex !== undefined ? endIndex : end !== undefined ? end : text.length

  const newFormats = formats.slice()

  for (let i = actualStart; i < actualEnd; i++) {
    const currentFormats = newFormats[i] || []
    const existingIndex = currentFormats.findIndex(function (f) {
      return f.type === format.type
    })

    if (existingIndex !== -1) {
      const updated = currentFormats.slice()
      updated[existingIndex] = format
      newFormats[i] = updated
    } else {
      newFormats[i] = currentFormats.concat([format])
    }
  }

  return {
    text: text,
    formats: newFormats,
    replacements: replacements,
    start: start,
    end: end,
  }
}
