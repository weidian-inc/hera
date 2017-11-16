import organizeValue from './copyUtils';
import symbolHandle from './symbolHandle';

function emptyFn(e) {}
function copyHandle(data) {
    var method = arguments.length <= 1 || undefined === arguments[1] ? emptyFn: arguments[1];
    if (null === data) {
        return null;
    }
    var value = organizeValue.copyValue(data);
    if (null !== value) {
        return value;
    }
    var coll = organizeValue.copyCollection(data, method),
        newAttr = null !== coll ? coll: data,
        attrArr = [data],
        newAttrArr = [newAttr];
    return iteratorHandle(data, method, newAttr, attrArr, newAttrArr);
}
function iteratorHandle(data, method, newAttr, attrArr, newAttrArr) {//处理对象循环引用情况
    if (null === data) {
        return null;
    }
    var value = organizeValue.copyValue(data);
    if (null !== value) {
        return value;
    }
    var keys = symbolHandle.getKeys(data).concat(symbolHandle.getSymbols(data));
    var index ,length ,key ,attrValue ,attrValueIndex ,newAttrValue ,curAttrValue ,tmpObj ;
    for (index = 0, length = keys.length; index < length; ++index) {
        key = keys[index];
        attrValue = data[key];
        attrValueIndex = symbolHandle.indexOf(attrArr, attrValue);//确定data的子属性有没引用自身
        tmpObj = undefined;
        curAttrValue = undefined;
        newAttrValue = undefined;
        attrValueIndex === -1 ?
            (newAttrValue = organizeValue.copy(attrValue, method),
            curAttrValue = null !== newAttrValue ? newAttrValue: attrValue,
            null !== attrValue && /^(?:function|object)$/.test(typeof(attrValue))
            && (attrArr.push(attrValue), newAttrArr.push(curAttrValue)))
            : tmpObj = newAttrArr[attrValueIndex];
        newAttr[key] = tmpObj || iteratorHandle(attrValue, method, curAttrValue, attrArr, newAttrArr);
    }
    return newAttr;
}

export default copyHandle;