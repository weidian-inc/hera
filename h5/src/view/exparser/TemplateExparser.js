import Events from './Events'

const TemplateExparser = function () {}
TemplateExparser.prototype = Object.create(Object.prototype, {
  constructor: {
    value: TemplateExparser,
    writable: true,
    configurable: true
  }
})

TemplateExparser.parse = function (value, methods) {
  let tempObj = Object.create(TemplateExparser.prototype)
  let slices = value.split(/\{\{(.*?)\}\}/g)
  let boundPropList = []
  for (let idx = 0; idx < slices.length; idx++) {
    if (idx % 2) {
      let methodSlices = slices[idx].match(/^(!?)([-_a-zA-Z0-9]+)(?:\((([-_a-zA-Z0-9]+)(,[-_a-zA-Z0-9]+)*)\))?$/) || [!1, '']//"test(a,b,c)"
      let args = null
      if (methodSlices[3]) {
        args = methodSlices[3].split(',')
        for (let argIdx = 0; argIdx < args.length; argIdx++) {
          boundPropList.indexOf(args[argIdx]) < 0 && boundPropList.push(args[argIdx])
        }
      } else { // single arg
        boundPropList.indexOf(methodSlices[2]) < 0 && boundPropList.push(methodSlices[2])
      }
      slices[idx] = {
        not: !!methodSlices[1],
        prop: methodSlices[2],//方法名
        callee: args//参数
      }
    }
  }

  tempObj.bindedProps = boundPropList//相关联的data key
  tempObj.isSingleletiable = slices.length === 3 && slices[0] === '' && slices[2] === ''//仅表达式
  tempObj._slices = slices
  tempObj._methods = methods
  return tempObj
}

const propCalculate = function (ele, data, methods, opt) {//解析模板
  let res = ''
  if (opt.callee) {
    let args = [], idx = 0
    for (; idx < opt.callee.length; idx++) {
      args[idx] = data[opt.callee[idx]]
    }
    res = Events.safeCallback('TemplateExparser Method', methods[opt.prop], ele, args)
    undefined !== res && res !== null || (res = '')
  } else {
    res = data[opt.prop]
  }
  if (opt.not) {
    return !res
  } else {
    return res
  }
}

TemplateExparser.prototype.calculate = function (ele, data) {//解析模板返回结果
  let slices = this._slices
  let opt = null
  let value = ''
  if (this.isSingleletiable) {
    opt = slices[1]
    value = propCalculate(ele, data, this._methods, opt)
  } else {
    for (let idx = 0; idx < slices.length; idx++) {
      opt = slices[idx]
      if (idx % 2) {
        value += propCalculate(ele, data, this._methods, opt)
      } else {
        value += opt
      }
    }
  }
  return value
}

export default TemplateExparser
