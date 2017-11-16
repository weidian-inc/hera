import Properties from './Properties'
import Enums from './Enums'

class VPatch {
  constructor (type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
  }

  apply (node) {
    switch (this.type) {
      case Enums.PATCH_TYPE.TEXT:
        return VPatch.stringPatch(node, this.patch)
      case Enums.PATCH_TYPE.VNODE:
        return VPatch.vNodePatch(node, this.patch)
      case Enums.PATCH_TYPE.PROPS:
        return VPatch.applyProperties(node, this.patch, this.vNode.props)
      case Enums.PATCH_TYPE.REORDER:
        return VPatch.reorderChildren(node, this.patch)
      case Enums.PATCH_TYPE.INSERT:
        return VPatch.insertNode(node, this.patch)
      case Enums.PATCH_TYPE.REMOVE:
        return VPatch.removeNode(node)
      default:
        return node
    }
  }

  static stringPatch (node, patch) {
    let parent = node.parentNode
    let newEle = patch.render()
    parent && newEle !== node && parent.replaceChild(newEle, node)
    return newEle
  }

  static vNodePatch (node, patch) {
    let parent = node.parentNode
    let newEle = patch.render()
    parent && newEle !== node && parent.replaceChild(newEle, node)
    return newEle
  }

  static applyProperties (node, patch, prop) {
    Properties.applyProperties(node, patch, prop)
    return node
  }

  static reorderChildren (node, moves) {
    let removes = moves.removes
    let inserts = moves.inserts
    let childNodes = node.childNodes
    let removedChildren = {}

    removes.forEach(function (remove) {
      let childNode = childNodes[remove.index]
      remove.key && (removedChildren[remove.key] = childNode)
      node.removeChild(childNode)
    })

    inserts.forEach(function (insert) {
      let childNode = removedChildren[insert.key]
      node.insertBefore(childNode, childNodes[insert.index])
    })

    return node
  }

  static insertNode (node, patch) {
    let newEle = patch.render()
    node && node.appendChild(newEle)
    return node
  }

  static removeNode (node) {
    let parent = node.parentNode
    parent && parent.removeChild(node)
    return null
  }
}
export default VPatch
