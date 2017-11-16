import Events from './Events'
//监视器模块
const Observer = function () {}

Observer.prototype = Object.create(Object.prototype, {
  constructor: {
    value: Observer,
    writable: true,
    configurable: true
  }
})

Observer.create = function (cb) {
  let tempObj = Object.create(Observer.prototype)
  tempObj._cb = cb
  tempObj._noSubtreeCb = function (opt) {
    opt.target === this && cb.call(this, opt)
  }
  tempObj._binded = []
  return tempObj
}

const updateSubtreeCaches = Observer._updateSubtreeCaches = function (ele, count) {
  ele.__subtreeObserversCount += count
  let childNodes = ele.childNodes
  if (childNodes) {
    for (let idx = 0; idx < childNodes.length; idx++) {
      updateSubtreeCaches(childNodes[idx], count)
    }
  }
}

Observer.prototype.observe = function (ele, opt) {
  opt = opt || {}
  let count = 0
  let subtree = opt.subtree ? this._cb : this._noSubtreeCb//是否对子节点observe
  if (opt.properties) {
    ele.__propObservers || (ele.__propObservers = Events.create('Observer Callback'))
    this._binded.push({
      funcArr: ele.__propObservers,
      id: ele.__propObservers.add(subtree),
      subtree: opt.subtree ? ele : null
    })
    count++
  }
  if (opt.childList) {
    ele.__childObservers || (ele.__childObservers = Events.create('Observer Callback'))
    this._binded.push({
      funcArr: ele.__childObservers,
      id: ele.__childObservers.add(subtree),
      subtree: opt.subtree ? ele : null
    })
    count++
  }

  if (opt.characterData) {
    ele.__textObservers || (ele.__textObservers = Events.create('Observer Callback'))
    this._binded.push({
      funcArr: ele.__textObservers,
      id: ele.__textObservers.add(subtree),
      subtree: opt.subtree ? ele : null
    })
    count++
  }
  opt.subtree && updateSubtreeCaches(ele, count)
}

Observer.prototype.disconnect = function () {
  let bound = this._binded
  let idx = 0
  for (; idx < bound.length; idx++) {
    let boundObserver = bound[idx]
    boundObserver.funcArr.remove(boundObserver.id)
    boundObserver.subtree && updateSubtreeCaches(boundObserver.subtree, -1)
  }
  this._binded = []
}

Observer._callObservers = function (ele, observeName, opt) {
  do {
    ele[observeName] && ele[observeName].call(ele, [opt])
    ele = ele.parentNode
  } while (ele && ele.__subtreeObserversCount)
}

export default Observer
