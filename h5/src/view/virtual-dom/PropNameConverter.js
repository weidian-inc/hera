const cache = {}
const regexDict = {
  dashToCamel: /-[a-z]/g,
  camelToDash: /([A-Z])/g
}

const dashToCamelCase = function (str) {
  if (cache[str]) {
    return cache[str]
  } else {
    if (str.indexOf('-') <= 0) {
      cache[str] = str
    } else {
      cache[str] = str.replace(regexDict.dashToCamel, function (match) {
        return match[1].toUpperCase()
      })
    }
    return cache[str]
  }
}

const camelToDashCase = function (str) {
  return cache[str] ||
    (cache[str] = str.replace(regexDict.camelToDash, '-$1').toLowerCase())
}

export default {
  dashToCamelCase,
  camelToDashCase
}
