
function indexOf(arr, element) {
    if ("[object Array]" !== toString.call(arr)) {
        throw new TypeError("array must be an Array");
    }
    var index = void 0,
        arrLen = void 0,
        cur = void 0;
    for (index = 0, arrLen = arr.length; index < arrLen; ++index) {
        cur = arr[index];
        if (cur === element || cur !== cur && element !== element) {
            return index;
        }
    }
    return - 1;
}


var toString = Object.prototype.toString;
var getKeys = "function" == typeof Object.keys ?
    function(obj) {
        return Object.keys(obj);
    }:
    function(obj) {
        var type = typeof(obj);
        if (null === obj || "function" !== type && "object" !== type) throw new TypeError("obj must be an Object");
        var res = [],key ;
        for (key in obj) {
            Object.prototype.hasOwnProperty.call(obj, key) && res.push(key);
        }
        return res;
    };
var getSymbols = "function" == typeof Symbol ?
    function(e) {
        return Object.getOwnPropertySymbols(e);
    }: function() {
        return []
    };

export default {
    getKeys,
    getSymbols,
    indexOf
}