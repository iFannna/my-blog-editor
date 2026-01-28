/**
 * 获取当前选区的活跃格式
 */

export function getActiveFormats(value) {
  const { formats, start, end, pendingFormats } = value

  // 如果有待应用的格式（用于光标位置切换格式），优先返回
  if (pendingFormats && pendingFormats.length > 0) {
    return pendingFormats
  }

  if (start === undefined || end === undefined) {
    return []
  }

  // 光标位置
  if (start === end) {
    // 如果在开头位置，检查是否有格式
    if (start === 0) {
      return formats[0] || []
    }
    // 返回光标前一个字符的格式
    return formats[start - 1] || []
  }

  // 有选区：返回所有字符共有的格式
  let common = null

  for (let i = start; i < end; i++) {
    const charFormats = formats[i] || []

    if (common === null) {
      common = charFormats.slice()
    } else {
      common = common.filter(function (f) {
        return charFormats.some(function (cf) {
          return (
            f.type === cf.type && JSON.stringify(f.attributes) === JSON.stringify(cf.attributes)
          )
        })
      })
    }

    if (common.length === 0) {
      break
    }
  }

  return common || []
}
