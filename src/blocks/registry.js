/**
 * 块注册表
 */

const blockTypes = new Map()
let idCounter = 0

export function registerBlockType(name, settings) {
  if (blockTypes.has(name)) {
    console.warn('Block "' + name + '" is already registered.')
    return
  }
  blockTypes.set(name, Object.assign({ name: name }, settings))
}

export function getBlockType(name) {
  return blockTypes.get(name)
}

export function getBlockTypes() {
  return Array.from(blockTypes.values())
}

export function createBlock(name, attributes, innerBlocks) {
  attributes = attributes || {}
  innerBlocks = innerBlocks || []

  const blockType = getBlockType(name)

  if (!blockType) {
    throw new Error('Block type "' + name + '" is not registered.')
  }

  // 合并默认属性
  const defaultAttrs = {}
  const attrDefs = blockType.attributes || {}

  for (const key in attrDefs) {
    if (attrDefs[key].default !== undefined) {
      defaultAttrs[key] = attrDefs[key].default
    }
  }

  idCounter++

  return {
    clientId: 'block-' + Date.now() + '-' + idCounter,
    name: name,
    attributes: Object.assign({}, defaultAttrs, attributes),
    innerBlocks: innerBlocks,
  }
}
