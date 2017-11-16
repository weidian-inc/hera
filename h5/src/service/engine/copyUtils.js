
function copy(obj, customizerFn) {
    var res = copyValue(obj);
    return null !== res ? res: copyCollection(obj, customizerFn);
}
function copyCollection(obj, customizerFn) {
    if ("function" != typeof customizerFn) {
        throw new TypeError("customizer is must be a Function");
    }
    if ("function" == typeof obj) {
        return obj;
    }
    var typeString = toString.call(obj);
    if ("[object Array]" === typeString) {
        return [];
    }
    if ("[object Object]" === typeString && obj.constructor === Object) {
        return {};
    }
    if ("[object Date]" === typeString) {
        return new Date(obj.getTime());
    }
    if ("[object RegExp]" === typeString) {
        var toStr = String(obj),
            pos = toStr.lastIndexOf("/");
        return new RegExp(toStr.slice(1, pos), toStr.slice(pos + 1))
    }
    var res = customizerFn(obj);
    return undefined !== res ? res: null;
}
function copyValue(param) {
    var type = typeof(param);
    return null !== param && "object" !== type && "function" !== type ? param: null;
}
var toString = Object.prototype.toString;
export default {
    copy,
    copyCollection,
    copyValue
}