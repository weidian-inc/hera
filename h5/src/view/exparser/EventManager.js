import Events from './Events'

const now = Date.now()

export function triggerEvent (target, type, detail, options) {
  options = options || {}
  let originalEvent = options.originalEvent,
    noBubbles = !options.bubbles,
    noComposed = !options.composed,
    extraFields = options.extraFields || {},
    stopTarget = false,
    timeStamp = Date.now() - now,
    nTarget = target.__wxElement || target

  target === nTarget.shadowRoot && (nTarget = target)//_renderingMode === 'native'

  const preventDefault = function () {
    originalEvent && originalEvent.preventDefault()
  }

  const stopPropagation = function () {
    stopTarget = true
  }

  const eventOpt = {
    target: nTarget,
    currentTarget: nTarget,
    type: type,
    timeStamp: timeStamp,
    detail: detail,
    preventDefault: preventDefault,
    stopPropagation: stopPropagation
  }

  for (let f in extraFields) {
    eventOpt[f] = extraFields[f]
  }

  let exeEvent = function (event, targetEle) {
    eventOpt.currentTarget = targetEle
    const res = event.call(targetEle, [eventOpt])
    if (res === !1) {
      preventDefault()
      stopPropagation()
    }
  }
  let targetParent = nTarget.parentNode
  let targetEle = nTarget

  const goAhead = function () {//冒泡执行事件
    if (targetEle) {
      targetParent === targetEle && (targetParent = targetEle.parentNode)
      if (targetEle.__wxEvents) {
        targetEle.__wxEvents[type] && exeEvent(targetEle.__wxEvents[type], targetEle)
      }
      return !noBubbles && !stopTarget
    }
    return false
  }

  for (; goAhead();) {
    if (targetEle.__host) {
      if (noComposed) break
      if (!(targetParent && targetParent.__domElement)) {
        targetParent = targetEle.__host
        eventOpt.target = targetParent
      }
      targetEle = targetEle.__host
    } else {
      let isRealDom = !0
      if (targetEle.__domElement || targetEle.__virtual) {
        isRealDom = !1
      }
      targetEle = isRealDom || noComposed ? targetEle.parentNode : targetEle.__slotParent
    }
  }
}

export function addListenerToElement (ele, eventName, handler) {
  let targetEle = ele.__wxElement || ele//vnode
  ele === targetEle.shadowRoot && (targetEle = ele)
  targetEle.__wxEvents || (targetEle.__wxEvents = Object.create(null))
  targetEle.__wxEvents[eventName] || (targetEle.__wxEvents[eventName] = Events.create('Event Listener'))
  return targetEle.__wxEvents[eventName].add(handler)
}

export function removeListenerFromElement (ele, eventName, handler) {
  let targetEle = ele.__wxElement || ele
  ele === targetEle.shadowRoot && (targetEle = ele)
  targetEle.__wxEvents && targetEle.__wxEvents[eventName] && targetEle.__wxEvents[eventName].remove(handler)
}
