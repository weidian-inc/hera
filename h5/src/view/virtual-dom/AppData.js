import objPath from './objPath'

let data = {}

class AppData {
  constructor () {}

  static getAppData () {
    return data
  }

  static mergeData (originObj, anotherObj) {
    let originData = JSON.parse(JSON.stringify(originObj))
    for (let dataName in anotherObj) {
      let paths = objPath.parsePath(dataName)
      let data = objPath.getObjectByPath(originObj, paths, !1)
      let dObj = data.obj,
        dKey = data.key,
        sData = objPath.getObjectByPath(originData, paths, !0),
        sObj = sData.obj,
        sKey = sData.key,
        sChanged = sData.changed

      dObj && (dObj[dKey] = anotherObj[dataName])

      if (sObj) {
        if (sChanged) {
          sObj[sKey] = anotherObj[dataName]
        } else {
          sObj[sKey] = {
            __value__: anotherObj[dataName],
            __wxspec__: !0
          }
        }
      }
    }
    return originData
  }
}

export default AppData
