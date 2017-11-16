import Events from './Events'
import * as EventManager from './EventManager'
import Behavior from './Behavior'
import Element from './Element'
import Component from './Component'
import TextNode from './TextNode'
import VirtualNode from './VirtualNode'
import Observer from './Observer'

const globalOptions = {
  renderingMode: 'full',
  keepWhiteSpace: false,
  parseTextContent: true,
  throwGlobalError: false
}

Component._setGlobalOptionsGetter(function () {
  return globalOptions
})
Events._setGlobalOptionsGetter(function () {
  return globalOptions
})

// Expose all related class
export {
  Behavior,
  Element,
  TextNode,
  VirtualNode,
  Component,
  Observer,
  globalOptions
}

// Register
export const registerBehavior = Behavior.create
export const registerElement = Component.register

// Create node
export const createElement = Component.create
export const createTextNode = TextNode.create
export const createVirtualNode = VirtualNode.create

// Dom manipulation
export const appendChild = Element.appendChild
export const insertBefore = Element.insertBefore
export const removeChild = Element.removeChild
export const replaceChild = Element.replaceChild

// Event
export const addListenerToElement = EventManager.addListenerToElement
export const removeListenerFromElement = EventManager.removeListenerFromElement
export const triggerEvent = EventManager.triggerEvent
export const addGlobalErrorListener = Events.addGlobalErrorListener
export const removeGlobalErrorListener = Events.removeGlobalErrorListener
