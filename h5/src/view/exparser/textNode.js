import Observer from './Observer'
const TextNode = function () {}
TextNode.prototype = Object.create(Object.prototype, {
  constructor: {
    value: TextNode,
    writable: true,
    configurable: true
  }
})

// createTextNode
TextNode.create = function (txt) {
  const tempObj = Object.create(TextNode.prototype)
  tempObj.$$ = tempObj.__domElement = document.createTextNode(txt || '')
  tempObj.__domElement.__wxElement = tempObj
  tempObj.__subtreeObserversCount = 0
  tempObj.parentNode = null
  return tempObj
}

Object.defineProperty(TextNode.prototype, 'textContent', {
  get: function () {
    return this.__domElement.textContent
  },
  set: function (txt) {
    this.__domElement.textContent = txt
    if (this.__textObservers && !this.__textObservers.empty || this.__subtreeObserversCount) {
      Observer._callObservers(this, '__textObservers', {
        type: 'characterData',
        target: this
      })
    }
  }
})
export default TextNode
