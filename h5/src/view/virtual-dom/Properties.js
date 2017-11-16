import Utils from './Utils'
import Enums from './Enums'
import PropNameConverter from './PropNameConverter'

const dataPrefixReg = /^data-/

function removeProperty (ele, props) {
  let hasProp = exparser.Component.hasProperty(ele, props)
  if (hasProp) {
    ele[props] = void 0
  } else {
    if (props.slice(0, 4) === 'bind') {
      addEventHandler(ele, props.slice(4), '')
    } else {
      if (props.slice(0, 5) === 'catch') {
        addEventHandler(ele, props.slice(5), '', !0)
      } else {
        if (props.slice(0, 2) === 'on') {
          addEventHandler(ele, props.slice(2), '')
        } else {
          if (
            Enums.ATTRIBUTE_NAME.indexOf(props) !== -1 ||
            dataPrefixReg.test(props)
          ) {
            ele.$$.removeAttribute(props)
          }
        }
      }
    }
  }
}
//设置ele属性
function applyProperties (ele, props) {
  ele.dataset = ele.dataset || {}
  for (let propName in props) {
    let propValue = props[propName],
      propExist = exparser.Component.hasProperty(ele, propName)
    if (/^data-/.test(propName)) {
      let convertedPropName = PropNameConverter.dashToCamelCase(
        propName.substring(5).toLowerCase()
      )
      ele.dataset[convertedPropName] = propValue
    }

    if (void 0 === propValue) {
      removeProperty(ele, propName)
    } else {
      if (propExist) {
        if (Enums.INLINE_STYLE.indexOf(propName) !== -1) {
          ele[propName] = Utils.transformRpx(propValue, !0)
        } else {
          ele[propName] = propValue
        }
      } else {
        if (propName.slice(0, 4) === 'bind') {
          addEventHandler(ele, propName.slice(4), propValue)
        } else {
          if (propName.slice(0, 5) === 'catch') {
            addEventHandler(ele, propName.slice(5), propValue, !0)
          } else {
            if (propName.slice(0, 2) === 'on') {
              addEventHandler(ele, propName.slice(2), propValue)
            } else {
              const isElementAttribute = Enums.ATTRIBUTE_NAME.indexOf(propName) !== -1 || dataPrefixReg.test(propName)
              if (isElementAttribute) {
                if (propName === 'style') {
                  !(function () {
                    let animationStyle = ele.animationStyle || {},//动画执行结果样式
                      transition = animationStyle.transition,
                      transform = animationStyle.transform,
                      transitionProperty = animationStyle.transitionProperty,
                      transformOrigin = animationStyle.transformOrigin,
                      cssAttributes = {
                        transition: transition,
                        transform: transform,
                        transitionProperty: transitionProperty,
                        transformOrigin: transformOrigin
                      }
                    cssAttributes[
                      '-webkit-transition'
                    ] = cssAttributes.transition
                    cssAttributes[
                      '-webkit-transform'
                    ] = cssAttributes.transform
                    cssAttributes[
                      '-webkit-transition-property'
                    ] = cssAttributes.transitionProperty
                    cssAttributes[
                      '-webkit-transform-origin'
                    ] = cssAttributes.transformOrigin

                    const refinedAttrs = Object.keys(cssAttributes)
                      .filter(function (attribute) {
                        return !(
                          (/transform|transition/i.test(attribute) && cssAttributes[attribute] === '') ||
                          attribute.trim() === '' ||
                          void 0 === cssAttributes[attribute] ||
                          cssAttributes[attribute] === '' ||
                          !isNaN(parseInt(attribute)))
                      })
                      .map(function (attr) {
                        let dashedProp = attr.replace(
                          /([A-Z]{1})/g,
                          function (str) {
                            return '-' + str.toLowerCase()
                          }
                        )
                        return dashedProp + ':' + cssAttributes[attr]
                      })
                      .join(';')

                    ele.$$.setAttribute(
                      propName,
                      Utils.transformRpx(propValue, !0) + refinedAttrs
                    )
                  })()
                } else {
                  ele.$$.setAttribute(propName, propValue)
                }
              } else {
                const isAnimationProp = propName === 'animation' && typeof(propValue) === 'object'
                const isPropHasActions = propValue.actions && propValue.actions.length > 0
                if (isAnimationProp && isPropHasActions) {
                  !(function () {
                    const execAnimationAction = function () {
                      if (turns < actonsLen) {
                        let styles = wx.animationToStyle(actons[turns]),
                          transition = styles.transition,
                          transitionProperty = styles.transitionProperty,
                          transform = styles.transform,
                          transformOrigin = styles.transformOrigin,
                          style = styles.style
                        ele.$$.style.transition = transition
                        ele.$$.style.transitionProperty = transitionProperty
                        ele.$$.style.transform = transform
                        ele.$$.style.transformOrigin = transformOrigin
                        ele.$$.style.webkitTransition = transition
                        ele.$$.style.webkitTransitionProperty = transitionProperty
                        ele.$$.style.webkitTransform = transform
                        ele.$$.style.webkitTransformOrigin = transformOrigin
                        for (let idx in style) {
                          ele.$$.style[idx] = Utils.transformRpx(' ' + style[idx], !0)
                        }

                        ele.animationStyle = {
                          transition: transition,
                          transform: transform,
                          transitionProperty: transitionProperty,
                          transformOrigin: transformOrigin
                        }
                      }
                    }
                    let turns = 0
                    let actons = propValue.actions
                    let actonsLen = propValue.actions.length

                    ele.addListener('transitionend', function () {
                      (turns += 1), execAnimationAction()
                    })
                    execAnimationAction()
                  })()
                }
              }
            }
          }
        }
      }
    }
  }
}

const getEleInfo = function (ele) {
  return {
    id: ele.id,
    offsetLeft: ele.$$.offsetLeft,
    offsetTop: ele.$$.offsetTop,
    dataset: ele.dataset
  }
}
const getTouchInfo = function (touches) {
  if (touches) {
    let touchInfo = [], idx = 0
    for (; idx < touches.length; idx++) {
      let touch = touches[idx]
      touchInfo.push({
        identifier: touch.identifier,
        pageX: touch.pageX,
        pageY: touch.pageY,
        clientX: touch.clientX,
        clientY: touch.clientY
      })
    }
    return touchInfo
  }
}
//事件绑定
const addEventHandler = function (ele, eventName, pageEventName, useCapture) {
  ele.__wxEventHandleName || (ele.__wxEventHandleName = Object.create(null))
  void 0 === ele.__wxEventHandleName[eventName] &&
    ele.addListener(eventName, function (event) {
      if (ele.__wxEventHandleName[eventName]) {
        window.wx.publishPageEvent(ele.__wxEventHandleName[eventName], {
          type: event.type,
          timeStamp: event.timeStamp,
          target: getEleInfo(event.target),
          currentTarget: getEleInfo(this),
          detail: event.detail,
          touches: getTouchInfo(event.touches),
          changedTouches: getTouchInfo(event.changedTouches)
        })
        return !useCapture && void 0
      }
    })
  ele.__wxEventHandleName[eventName] = pageEventName
}

export default {
  removeProperty,
  applyProperties
}
