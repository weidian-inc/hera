import utils from './utils';


export function parsePath(pathStr) {//解析data path
    for (var length = pathStr.length, paths = [], key = "", arrKey = 0, hasNum = false, arrStartFlag = false, index = 0; index < length; index++) {
        var curStr = pathStr[index];
        if ("\\" === curStr) {
            index + 1 < length && ("." === pathStr[index + 1] || "[" === pathStr[index + 1] || "]" === pathStr[index + 1]) ? (key += pathStr[index + 1], index++) : key += "\\";
        } else if ("." === curStr) {
            key && (paths.push(key), key = "");
        }else if ("[" === curStr) {
            if (key && (paths.push(key), key = ""), 0 === paths.length) {
                throw utils.error("数据路径错误", "Path can not start with []: " + pathStr);
                new utils.AppServiceEngineKnownError("Path can not start with []: " + pathStr);
            }
            arrStartFlag = true;
            hasNum = false;
        } else if ("]" === curStr) {
            if (!hasNum) {
                throw utils.error("数据路径错误", "Must have number in []: " + pathStr);
                new utils.AppServiceEngineKnownError("Must have number in []: " + pathStr);
            }  
            arrStartFlag = false;
            paths.push(arrKey);
            arrKey = 0;
        } else if (arrStartFlag) {
            if (curStr < "0" || curStr > "9") {
                throw utils.error("数据路径错误", "Only number 0-9 could inside []: " + pathStr);
                new utils.AppServiceEngineKnownError("Only number 0-9 could inside []: " + pathStr);
            }
            hasNum = true;
            arrKey = 10 * arrKey + curStr.charCodeAt(0) - 48;
        } else {
            key += curStr;
        }
    }
    if (key && paths.push(key), 0 === paths.length) {
        throw utils.error("数据路径错误", "Path can not be empty");
        new utils.AppServiceEngineKnownError("Path can not be empty");
    }
    return paths;
}
export function getObjectByPath(data, pathString) {
    var paths = parsePath(pathString), obj, curKey, curData = data;
    for (var index = 0; index < paths.length; index++){
        Number(paths[index]) === paths[index] && paths[index] % 1 === 0 ?//isint
        Array.isArray(curData) || (curData = []):
        utils.isPlainObject(curData) || (curData = {});
        curKey = paths[index];//key
        obj = curData;//parentObj
        curData = curData[paths[index]];//node value
    }
    return {
        obj: obj,
        key: curKey
    };
};