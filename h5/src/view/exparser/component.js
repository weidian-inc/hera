import Events from './Events'
import * as EventManager from './EventManager'
import Template from './Template'
import Behavior from './Behavior'
import Element from './Element'
import Observer from './Observer'

function camelToDashed (txt) {
  return txt.replace(/[A-Z]/g, function (ch) {
    return '-' + ch.toLowerCase()
  })
}

const addListenerToElement = EventManager.addListenerToElement

const Component = function () {}

Component.prototype = Object.create(Object.prototype, {
  constructor: {
    value: Component,
    writable: true,
    configurable: true
  }
})

Component.list = Object.create(null)
Template._setCompnentSystem(Component)
Element._setCompnentSystem(Component)

Component._setGlobalOptionsGetter = function (GlobalOptionsGetter) {
  Template._setGlobalOptionsGetter(GlobalOptionsGetter)
}

// attribute(this, prop, propKey, value)
const setAttribute = function (ele, opt, propKey, value) {
  let propName = camelToDashed(propKey)
  if (opt.type === Boolean) {
    value ? ele.__domElement.setAttribute(propName, '') : ele.__domElement.removeAttribute(propName)
  } else {
    if (opt.type !== Object) {
      if (opt.type === Array) {
        ele.__domElement.setAttribute(propName, JSON.stringify(value))
      } else {
        ele.__domElement.setAttribute(propName, value)
      }
    }
  }
}

const normalizeValue = function (value, type) {//根据type,格式化value
  if (type === String) {
    return value === null || undefined === value ? '' : String(value)
  } else {
    if (type === Number) {
      return isFinite(value) ? Number(value) : false
    } else {
      if (type === Boolean) {
        return !!value
      } else {
        if (type === Array) {
          return value instanceof Array ? value : []
        } else {
          return typeof value === 'object' ? value : null
        }
      }
    }
  }
}

// registerElement
Component.register = function (nElement) {
  let opts = nElement.options || {}
  let propDefination = {
    is: {
      value: nElement.is || ''
    }
  }
  let componentBehavior = Behavior.create(nElement)
  let behaviorProperties = Object.create(null)

  Object.keys(componentBehavior.properties).forEach(function (propKey) {
    let behaviorProperty = componentBehavior.properties[propKey]
    behaviorProperty !== String && behaviorProperty !== Number && behaviorProperty !== Boolean && behaviorProperty !== Object && behaviorProperty !== Array || (behaviorProperty = {
      type: behaviorProperty
    })
    if (undefined === behaviorProperty.value) {
      behaviorProperty.type === String ? behaviorProperty.value = '' : behaviorProperty.type === Number ? behaviorProperty.value = 0 : behaviorProperty.type === Boolean ? behaviorProperty.value = !1 : behaviorProperty.type === Array ? behaviorProperty.value = [] : behaviorProperty.value = null
    }

    behaviorProperties[propKey] = {
      type: behaviorProperty.type,
      value: behaviorProperty.value,
      coerce: componentBehavior.methods[behaviorProperty.coerce],
      observer: componentBehavior.methods[behaviorProperty.observer],
      public: !!behaviorProperty.public
    }

    propDefination[propKey] = {
      enumerable: true,
      get: function () {
        let propData = this.__propData[propKey]
        return void 0 === propData ? behaviorProperties[propKey].value : propData
      },
      set: function (value) {
        let behProp = behaviorProperties[propKey]
        value = normalizeValue(value, behProp.type)
        let propData = this.__propData[propKey]//old value

        if (behProp.coerce) {
          let realVal = Events.safeCallback('Property Filter', behProp.coerce, this, [value, propData])
          void 0 !== realVal && (value = realVal)
        }

        if (value !== propData) {  // value changed
          this.__propData[propKey] = value
          behProp.public && setAttribute(this, behProp, propKey, value)
          this.__templateInstance.updateValues(this, this.__propData, propKey)
          behProp.observer && Events.safeCallback('Property Observer', behProp.observer, this, [value, propData])
          if (behProp.public) {
            if (this.__propObservers && !this.__propObservers.empty || this.__subtreeObserversCount) {
              Observer._callObservers(this, '__propObservers', {
                type: 'properties',
                target: this,
                propertyName: propKey
              })
            }
          }
        }
      }
    }
  })//end forEach

  let proto = Object.create(Element.prototype, propDefination)
  proto.__behavior = componentBehavior
  for (let methodName in componentBehavior.methods) {
    proto[methodName] = componentBehavior.methods[methodName]
  }
  proto.__lifeTimeFuncs = componentBehavior.getAllLifeTimeFuncs()
  let publicProps = Object.create(null),
    defaultValuesJSON = {}
  for (let propName in behaviorProperties) {
    defaultValuesJSON[propName] = behaviorProperties[propName].value
    publicProps[propName] = !!behaviorProperties[propName].public
  }

  let insElement = document.getElementById(componentBehavior.is)
  if (!componentBehavior.template && insElement && insElement.tagName === 'TEMPLATE') {

  } else {
    insElement = document.createElement('template')
    insElement.innerHTML = componentBehavior.template || ''
  }

  let template = Template.create(insElement, defaultValuesJSON, componentBehavior.methods, opts)
  proto.__propPublic = publicProps
  let allListeners = componentBehavior.getAllListeners(),
    innerEvents = Object.create(null)
  for (let listenerName in allListeners) {
    let listener = allListeners[listenerName], eventList = [], idx = 0
    for (; idx < listener.length; idx++) {
      eventList.push(componentBehavior.methods[listener[idx]])
    }
    innerEvents[listenerName] = eventList
  }
  Component.list[componentBehavior.is] = {
    proto: proto,
    template: template,
    defaultValuesJSON: JSON.stringify(defaultValuesJSON),
    innerEvents: innerEvents
  }
}

// createElement
Component.create = function (tagName) {
  tagName = tagName ? tagName.toLowerCase() : 'virtual'
  let newElement = document.createElement(tagName)
  let sysComponent = Component.list[tagName] || Component.list['']
  let newComponent = Object.create(sysComponent.proto)//虚拟dom

  Element.initialize(newComponent)
  newComponent.__domElement = newElement
  newElement.__wxElement = newComponent
  newComponent.__propData = JSON.parse(sysComponent.defaultValuesJSON)
  let templateInstance = newComponent.__templateInstance = sysComponent.template.createInstance(newComponent)//参数多余？

  if (templateInstance.shadowRoot instanceof Element) {//VirtualNode
    Element._attachShadowRoot(newComponent, templateInstance.shadowRoot)
    newComponent.shadowRoot = templateInstance.shadowRoot
    newComponent.__slotChildren = [templateInstance.shadowRoot]
    templateInstance.shadowRoot.__slotParent = newComponent
  } else {
    newComponent.__domElement.appendChild(templateInstance.shadowRoot)
    newComponent.shadowRoot = newElement
    newComponent.__slotChildren = newElement.childNodes
  }

  newComponent.shadowRoot.__host = newComponent
  newComponent.$ = templateInstance.idMap
  newComponent.$$ = newElement
  templateInstance.slots[''] || (templateInstance.slots[''] = newElement)
  newComponent.__slots = templateInstance.slots//占位节点
  newComponent.__slots[''].__slotChildren = newComponent.childNodes

  let innerEvents = sysComponent.innerEvents
  for (let innerEventName in innerEvents) {
    let innerEventNameSlice = innerEventName.split('.', 2)
    let listenerName = innerEventNameSlice[innerEventNameSlice.length - 1]
    let nComponent = newComponent
    let isRootNode = true
    if (innerEventNameSlice.length === 2) {
      if (innerEventNameSlice[0] !== '') {
        isRootNode = !1
        innerEventNameSlice[0] !== 'this' && (nComponent = newComponent.$[innerEventNameSlice[0]])
      }
    }
    if (nComponent) {
      let innerEvent = innerEvents[innerEventName], listenerIdx = 0
      for (; listenerIdx < innerEvent.length; listenerIdx++) {
        if (isRootNode) {
          addListenerToElement(nComponent.shadowRoot, listenerName, innerEvent[listenerIdx].bind(newComponent))
        } else {
          addListenerToElement(nComponent, listenerName, innerEvent[listenerIdx].bind(newComponent))
        }
      }
    }
  }
  Component._callLifeTimeFuncs(newComponent, 'created')
  return newComponent
}
Component.hasProperty = function (ele, propName) {
  return undefined !== ele.__propPublic[propName]
}
Component.hasPublicProperty = function (ele, propName) {
  return ele.__propPublic[propName] === !0
}
Component._callLifeTimeFuncs = function (ele, funcName) {
  let func = ele.__lifeTimeFuncs[funcName]
  func.call(ele, [])
}
Component.register({
  is: '',
  template: '<wx-content></wx-content>',
  properties: {}
})

export default Component
