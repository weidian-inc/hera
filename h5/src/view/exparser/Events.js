const Events = function () {}
let globalOptions = null

Events.prototype = Object.create(Object.prototype, {
  constructor: {
    value: Events,
    writable: true,
    configurable: true
  }
})

Events._setGlobalOptionsGetter = function (opt) {
  globalOptions = opt
}

Events.create = function (type) {
  const viewUtilObject = Object.create(Events.prototype)
  viewUtilObject.empty = true
  viewUtilObject._type = type//错误报告用到区分事件类型
  viewUtilObject._arr = []
  viewUtilObject._index = 0
  return viewUtilObject
}

Events.prototype.add = function (func) {
  const id = this._index++
  this._arr.push({
    id: id,
    func: func
  })
  this.empty = false
  return id
}

Events.prototype.remove = function (itemToRemove) {
  let _arr = this._arr, idx = 0
  if ('function' == typeof itemToRemove) {
    for (idx = 0; idx < _arr.length; idx++)
      if (_arr[idx].func === itemToRemove) {
        _arr.splice(idx, 1)
        this.empty = !_arr.length
        return true
      }
  } else {
    for (idx = 0; idx < _arr.length; idx++) {
      if (_arr[idx].id === itemToRemove) {
        _arr.splice(idx, 1)
        this.empty = !_arr.length
        return true
      }
    }
  }
  return false
}

Events.prototype.call = function (ele, args) {//以element执行注册的所有方法
  let _arr = this._arr, isPreventDefault = false, idx = 0
  for (; idx < _arr.length; idx++) {
    let res = safeCallback(this._type, _arr[idx].func, ele, args)
    res === false && (isPreventDefault = true)
  }
  if (isPreventDefault) {
    return false
  }
}

const globalError = Events.create()
const errHandle = function (err, errData) {
  if (!errData.type || globalError.call(null, [err, errData]) !== false) {
    console.error(errData.message)
    if (globalOptions().throwGlobalError) {//是否扔出错误
      throw err
    }
    console.error(err.stack)
  }
}
const safeCallback = function (type, method, element, args) {//以element执行注册的method
  try {
    return method.apply(element, args)
  } catch (err) {
    let message = 'Exparser ' + (type || 'Error Listener') + ' Error @ '
    element && (message += element.is)
    message += '#' + (method.name || '(anonymous)')
    errHandle(err, {
      message: message,
      type: type,
      element: element,
      method: method,
      args: args
    })
  }
}

Events.safeCallback = safeCallback

Events.addGlobalErrorListener = function (func) {//注册出错时的处理方法
  return globalError.add(func)
}

Events.removeGlobalErrorListener = function (func) {
  return globalError.remove(func)
}

export default Events