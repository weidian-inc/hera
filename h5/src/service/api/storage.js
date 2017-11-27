import Emitter from 'emitter'

// 5MB
const LIMIT_SIZE = 5 * 1024

let directory = '__hera__storage__'

function currentSize () {
  var total = 0
  for (var x in localStorage) {
    var amount = localStorage[x].length * 2 / 1024
    total += amount
  }
  return Math.ceil(total)
}

let storage = {
  set: function (key, value) {
    if (window.localStorage == null) {
      return console.error('localStorage not supported')
    }
    let str = localStorage.getItem(directory)
    let obj
    obj = str ? JSON.parse(str) : {}
    obj[key] = value
    localStorage.setItem(directory, JSON.stringify(obj))
    this.emit('change')
  },
  get: function (key) {
    if (window.localStorage == null) {
      return console.error('localStorage not supported')
    }
    let str = localStorage.getItem(directory)
    let obj
    obj = str ? JSON.parse(str) : {}
    return {
      data: obj[key]
    }
  },
  remove: function (key) {
    if (window.localStorage == null) {
      return console.error('localStorage not supported')
    }
    let str = localStorage.getItem(directory)
    if (!str) return
    let obj = JSON.parse(str)
    let data = obj[key]
    delete obj[key]
    localStorage.setItem(directory, JSON.stringify(obj))
    this.emit('change')
    return data
  },
  clear: function () {
    if (window.localStorage == null) {
      return console.error('localStorage not supported')
    }
    localStorage.removeItem(directory)
    this.emit('change')
  },
  getAll: function () {
    if (window.localStorage == null) {
      return console.error('localStorage not supported')
    }
    let str = localStorage.getItem(directory)
    let obj = str ? JSON.parse(str) : {}
    let res = {}
    Object.keys(obj).forEach(function (key) {
      res[key] = {
        data: obj[key]
      }
    })
    return res
  },
  info: function () {
    if (window.localStorage == null) {
      return console.error('localStorage not supported')
    }
    let str = localStorage.getItem(directory)
    let obj = str ? JSON.parse(str) : {}
    return {
      keys: Object.keys(obj),
      limitSize: LIMIT_SIZE,
      currentSize: currentSize()
    }
  }
}

Emitter(storage)

function toResult (msg, data, command) {
  var obj = {
    ext: data, // 传过来的数据
    msg: msg // 调用api返回的结果
  }
  if (command) obj.command = command
  return obj
}

function toError (data, result = false, extra = {}) {
  // let name = data.sdkName.replace(/Sync$/, '')
  let name = data.sdkName
  let obj = Object.assign(
    {
      errMsg: `${name}:fail`
    },
    extra
  )
  return toResult(obj, data, result ? 'GET_ASSDK_RES' : null)
}

function toSuccess (data, result = false, extra = {}) {
  // let name = data.sdkName.replace(/Sync$/, '')
  let name = data.sdkName
  let obj = Object.assign(
    {
      errMsg: `${name}:ok`
    },
    extra
  )
  return toResult(obj, data, result ? 'GET_ASSDK_RES' : null)
}

export function set (key, data) {
  storage.set(key, data)
}

export function setStorage (args) {
  const res = {
    errMsg: 'setStorage:ok'
  }
  if (args.key == null || args.data == null) {
    args.fail && args.fail(args)
  }
  storage.set(args.key, args.data)
  args.success && args.success(res)
  args.complete && args.complete(res)
}

export function get (key) {
  return storage.get(key)
}

export function getStorage (args) {
  if (args.key == null) {
    args.fail && args.fail()
  }
  var rt = storage.get(args.key)
  let res = null
  if (rt.data == null) {
    res = {
      errMsg: 'getStorage:fail data not fosund'
    }
    args.fail && args.fail(res)
  } else {
    res = rt
    args.success && args.success(res)
  }
  args.complete && args.complete(res)
}

export function clearStorageSync (data) {
  storage.clear()
}

export function clearStorage (data) {
  storage.clear()
}

export function remove (data) {
  storage.remove()
}

export function removeStorage (args) {
  if (args.key == null) {
    args.fail && args.fail()
  }
  storage.remove(args.key)
  args.success && args.success()
  args.complete && args.complete()
}

export function getStorageInfo (args) {
  let obj = storage.info()
  args.success && args.success(obj)
  args.complete && args.complete(obj)
}

export function getStorageInfoSync () {
  let obj = storage.info()
  return obj
}
