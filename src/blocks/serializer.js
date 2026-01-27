/**
 * Block[] → HTML
 */

import { getBlockType } from './registry.js'

function serializeAttributes(attributes) {
  return JSON.stringify(attributes)
    .replace(/--/g, '\\u002d\\u002d')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

function getCommentDelimitedContent(blockName, attributes, content) {
  // 去掉 core/ 前缀
  const shortName = blockName.replace(/^core\//, '')

  const attrString = Object.keys(attributes).length > 0 ? ' ' + serializeAttributes(attributes) : ''

  if (!content) {
    return '<!-- wp:' + shortName + attrString + ' /-->'
  }

  return (
    '<!-- wp:' + shortName + attrString + ' -->\n' + content + '\n<!-- /wp:' + shortName + ' -->'
  )
}

export function serializeBlock(block) {
  const blockType = getBlockType(block.name)

  if (!blockType) {
    return ''
  }

  // 调用块的 save 函数获取内容
  const content = blockType.save({ attributes: block.attributes })

  // 只保存非默认、非 source 属性到注释
  const commentAttrs = {}
  const attrDefs = blockType.attributes || {}

  for (const key in block.attributes) {
    const value = block.attributes[key]
    const def = attrDefs[key]

    // 跳过有 source 的属性（从内容中提取）
    if (def && def.source) {
      continue
    }

    // 跳过默认值
    if (def && value === def.default) {
      continue
    }

    commentAttrs[key] = value
  }

  return getCommentDelimitedContent(block.name, commentAttrs, content)
}

export function serialize(blocks) {
  return blocks.map(serializeBlock).join('\n\n')
}
