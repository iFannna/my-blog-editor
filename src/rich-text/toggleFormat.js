/**
 * 切换格式
 */

import { applyFormat } from './applyFormat.js'
import { removeFormat } from './removeFormat.js'
import { getActiveFormats } from './getActiveFormats.js'

export function toggleFormat(value, format) {
  const activeFormats = getActiveFormats(value)
  const isActive = activeFormats.some(function (f) {
    return f.type === format.type
  })

  if (isActive) {
    return removeFormat(value, format.type)
  }

  return applyFormat(value, format)
}
