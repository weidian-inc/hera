import Element from './Element'
const SlotNode = function () {}

SlotNode.prototype = Object.create(Element.prototype, {
  constructor: {
    value: SlotNode,
    writable: true,
    configurable: true
  }
})

//对dom元素时行封装，返回虚拟dom
SlotNode.wrap = function (ele) {
  let tempObj = Object.create(SlotNode.prototype)
  Element.initialize(tempObj)
  tempObj.__domElement = ele
  ele.__wxElement = tempObj
  tempObj.$$ = ele
  return tempObj
}

export default SlotNode
