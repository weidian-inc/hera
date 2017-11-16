import Utils from './Utils'
import Properties from './Properties'
import Diff from './Diff'
import WxVirtualText from './WxVirtualText'

import './Enums'

class WxVirtualNode {
  constructor (tagName, props, newProps, wxKey, wxVkey, children) {
    this.tagName = tagName || 'div'
    this.props = props || {}
    this.children = children || []
    this.newProps = newProps || []
    this.wxVkey = wxVkey
    Utils.isUndefined(wxKey)
      ? (this.wxKey = void 0)
      : (this.wxKey = String(wxKey))
    this.descendants = 0//子节点数
    for (let c = 0; c < this.children.length; ++c) {
      let child = this.children[c]
      if (Utils.isVirtualNode(child)) {
        this.descendants += child.descendants
      } else {
        if (Utils.isString(child)) {
          this.children[c] = new WxVirtualText(child)
        } else {
          Utils.isVirtualText(child) ||
            console.log('invalid child', tagName, props, children, child)
        }
      }
      ++this.descendants
    }
  }

  render () {
    let ele = this.tagName !== 'virtual'
      ? exparser.createElement(this.tagName)
      : exparser.VirtualNode.create('virtual')

    Properties.applyProperties(ele, this.props)

    this.children.forEach(function (child) {
      let dom = child.render()
      ele.appendChild(dom)
    })

    return ele
  }

  diff (newNode) {
    return Diff.diff(this, newNode)
  }
}

WxVirtualNode.prototype.type = 'WxVirtualNode'

export default WxVirtualNode
