import VPatch from './VPatch'
import Patch from './Patch'
import Utils from './Utils'
import ListDiff from './ListDiff'
import Enums from './Enums'

const diff = function (oriEle, newEle) {
  let patches = {}
  diffNode(oriEle, newEle, patches, 0)
  return new Patch(oriEle, patches)
}

const diffNode = function (oriEle, newEle, patches, index) {
  if (oriEle !== newEle) {
    let patch = patches[index]
    if (newEle == null) {
      patch = appendPatch(patch, new VPatch(Enums.PATCH_TYPE.REMOVE, oriEle))
    } else if (Utils.isVirtualNode(newEle))
    {
      if (Utils.isVirtualNode(oriEle)) {
        if (
          oriEle.tagName === newEle.tagName && oriEle.wxKey === newEle.wxKey
        ) {
          if (oriEle.tagName === 'virtual' && oriEle.wxVkey !== newEle.wxVkey) {//虚拟节点变化
            patch = appendPatch(
              patch,
              new VPatch(Enums.PATCH_TYPE.VNODE, oriEle, newEle)
            )
          } else {
            let propPatches = diffProps(newEle.props, newEle.newProps)//属性变化
            propPatches &&
              (patch = appendPatch(
                patch,
                new VPatch(Enums.PATCH_TYPE.PROPS, oriEle, propPatches)
              ))
            patch = diffChildren(oriEle, newEle, patches, patch, index)
          }
        } else {
          patch = appendPatch(
            patch,
            new VPatch(Enums.PATCH_TYPE.VNODE, oriEle, newEle)
          )
        }
      } else {
        patch = appendPatch(
          patch,
          new VPatch(Enums.PATCH_TYPE.VNODE, oriEle, newEle)
        )
      }
    } else {
      if (!Utils.isVirtualText(newEle)) {
        console.log('unknow node type', oriEle, newEle)
        throw {
          message: 'unknow node type',
          node: newEle
        }
      }
      newEle.text !== oriEle.text &&
        (patch = appendPatch(
          patch,
          new VPatch(Enums.PATCH_TYPE.TEXT, oriEle, newEle)
        ))
    }
    patch && (patches[index] = patch)
  }
}

const diffChildren = function (old, newEle, patches, patch, index) {
  let oldChildren = old.children
  let orderedSet = ListDiff.listDiff(oldChildren, newEle.children)
  let newChildren = orderedSet.children
  let len = oldChildren.length > newChildren.length
    ? oldChildren.length
    : newChildren.length
  let idx = 0
  for (; idx < len; ++idx) {
    let oldChild = oldChildren[idx], newChild = newChildren[idx]
    ++index

    if (oldChild) {
      diffNode(oldChild, newChild, patches, index)
    } else {
      if (newChild) {
        patch = appendPatch(
          patch,
          new VPatch(Enums.PATCH_TYPE.INSERT, oldChild, newChild)
        )
      }
    }
    Utils.isVirtualNode(oldChild) && (index += oldChild.descendants)
  }
  orderedSet.moves &&
    (patch = appendPatch(
      patch,
      new VPatch(Enums.PATCH_TYPE.REORDER, old, orderedSet.moves)
    ))
  return patch
}
//设置属性
const diffProps = function (props, propKeys) {
  let tempObj = {}
  for (let key in propKeys) {
    let propName = propKeys[key]
    tempObj[propName] = props[propName]
  }
  return Utils.isEmptyObject(tempObj) ? void 0 : tempObj
}
//将newPatch加入到patches数组
const appendPatch = function (patches, newPatch) {
  if (patches) {
    patches.push(newPatch)
    return patches
  } else {
    return [newPatch]
  }
}

export default {
  diff,
  diffChildren,
  diffNode,
  diffProps,
  appendPatch
}
