import Utils from './Utils'

const parsePath = function (path) {
  let pathLen = path.length,
    strs = [],
    tempstr = '',
    numInBracket = 0,
    haveNumber = !1,
    inBracket = !1,
    index = 0
  for (; index < pathLen; index++) {
    let ch = path[index]
    if (ch === '\\') {
      if (index + 1 < pathLen) {
        if (
          path[index + 1] === '.' ||
          path[index + 1] === '[' ||
          path[index + 1] === ']'
        ) {
          tempstr += path[index + 1]
          index++
        } else {
          tempstr += '\\'
        }
      }
    } else if (ch === '.') {
      if (tempstr) {
        strs.push(tempstr)
        tempstr = ''
      }
    } else if (ch === '[') {
      if (tempstr) {
        strs.push(tempstr)
        tempstr = ''
      }

      if (strs.length === 0) {
        throw new Error('path can not start with []: ' + path)
      }
      inBracket = !0
      haveNumber = !1
    } else if (ch === ']') {
      if (!haveNumber) {
        throw new Error('must have number in []: ' + path)
      }
      inBracket = !1
      strs.push(numInBracket)
      numInBracket = 0
    } else if (inBracket) {
      if (ch < '0' || ch > '9') {
        throw new Error('only number 0-9 could inside []: ' + path)
      }
      haveNumber = !0
      numInBracket = 10 * numInBracket + ch.charCodeAt(0) - 48
    } else {
      tempstr += ch
    }
  }
  tempstr && strs.push(tempstr)
  if (strs.length === 0) {
    throw new Error('path can not be empty')
  }
  return strs
}

const getObjectByPath = function(obj, paths, spec) {
    for (var tempObj = void 0, key = void 0, originObj = obj, changed = !1, idx = 0; idx < paths.length; idx++){
        if(Number(paths[idx]) === paths[idx] && paths[idx] % 1 === 0){
            if("Array" !== Utils.getDataType(originObj)){
                if(spec && !changed){
                    changed = !0;
                    tempObj[key] = { __value__: [], __wxspec__: !0};
                    originObj = tempObj[key].__value__;
                }else{
                    tempObj[key] = [];
                    originObj = tempObj[key]
                }
            }
        }else{
            if("Object" !== Utils.getDataType(originObj)){
                if(spec && !changed){
                    changed = !0
                    tempObj[key] = { __value__: {}, __wxspec__: !0}
                    originObj = tempObj[key].__value__
                }else{
                    tempObj[key] = {}
                    originObj = tempObj[key]
                }
            }
        }
        key = paths[idx]
        tempObj = originObj
        originObj = originObj[paths[idx]]
        originObj && originObj.__wxspec__ && (originObj = originObj.__value__, changed = !0)
    }
    return {
        obj: tempObj,
        key: key,
        changed: changed
    }
}
export default {
  parsePath,
  getObjectByPath
}
