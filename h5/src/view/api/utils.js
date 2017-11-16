function _toArray(params) {//用params生成一个新数组
  if (Array.isArray(params)) {
    for (var t = 0, n = Array(params.length); t < params.length; t++) n[t] = params[t];
    return n
  }
  return Array.from(params)
}

function getRealRoute() {//格式化一个路径
  var pathPrefix = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "",
      pathname = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
  if (0 === pathname.indexOf("/")) return pathname.substr(1);
  if (0 === pathname.indexOf("./")) return getRealRoute(pathPrefix, pathname.substr(2));
  var index, folderLength, folderArr = pathname.split("/");
  for (index = 0, folderLength = folderArr.length; index < folderLength && ".." === folderArr[index]; index++);
  folderArr.splice(0, index);
  var prefixArr = pathPrefix.length > 0 ? pathPrefix.split("/") : [];
  prefixArr.splice(prefixArr.length - index - 1, index + 1);
  var pathArr = prefixArr.concat(folderArr);
  return pathArr.join("/")
}

function animationToStyle(params) {
  var animates = params.animates,
      option = params.option,
      opts = void 0 === option ? {} : option,
      transformOrigin = opts.transformOrigin,
      transition = opts.transition;
  if ("undefined" == typeof transition || "undefined" == typeof animates) {
    return {
      transformOrigin: "",
      transform: "",
      transition: ""
    };
  }

  var transform = animates.filter(function (animate) {
    var type = animate.type;
    return "style" !== type
  }).map(function (animate) {
    var animateType = animate.type,
        animateArgs = animate.args;
    switch (animateType) {
      case "matrix":
        return "matrix(" + animateArgs.join(",") + ")";
      case "matrix3d":
        return "matrix3d(" + animateArgs.join(",") + ")";
      case "rotate":
        return animateArgs = animateArgs.map(addDegSuffix), "rotate(" + animateArgs[0] + ")";
      case "rotate3d":
        return animateArgs[3] = addDegSuffix(animateArgs[3]), "rotate3d(" + animateArgs.join(",") + ")";
      case "rotateX":
        return animateArgs = animateArgs.map(addDegSuffix), "rotateX(" + animateArgs[0] + ")";
      case "rotateY":
        return animateArgs = animateArgs.map(addDegSuffix), "rotateY(" + animateArgs[0] + ")";
      case "rotateZ":
        return animateArgs = animateArgs.map(addDegSuffix), "rotateZ(" + animateArgs[0] + ")";
      case "scale":
        return "scale(" + animateArgs.join(",") + ")";
      case "scale3d":
        return "scale3d(" + animateArgs.join(",") + ")";
      case "scaleX":
        return "scaleX(" + animateArgs[0] + ")";
      case "scaleY":
        return "scaleY(" + animateArgs[0] + ")";
      case "scaleZ":
        return "scaleZ(" + animateArgs[0] + ")";
      case "translate":
        return animateArgs = animateArgs.map(addPXSuffix), "translate(" + animateArgs.join(",") + ")";
      case "translate3d":
        return animateArgs = animateArgs.map(addPXSuffix), "translate3d(" + animateArgs.join(",") + ")";
      case "translateX":
        return animateArgs = animateArgs.map(addPXSuffix), "translateX(" + animateArgs[0] + ")";
      case "translateY":
        return animateArgs = animateArgs.map(addPXSuffix), "translateY(" + animateArgs[0] + ")";
      case "translateZ":
        return animateArgs = animateArgs.map(addPXSuffix), "translateZ(" + animateArgs[0] + ")";
      case "skew":
        return animateArgs = animateArgs.map(addDegSuffix), "skew(" + animateArgs.join(",") + ")";
      case "skewX":
        return animateArgs = animateArgs.map(addDegSuffix), "skewX(" + animateArgs[0] + ")";
      case "skewY":
        return animateArgs = animateArgs.map(addDegSuffix), "skewY(" + animateArgs[0] + ")";
      default:
        return ""
    }
  }).join(" ")

  var style = animates.filter(function (animate) {
    var type = animate.type;
    return "style" === type
  }).reduce(function (res, cur) {
    return res[cur.args[0]] = cur.args[1], res
  }, {})

  var transitionProperty = ["transform"].concat(_toArray(Object.keys(style))).join(",");

  return {
    style: style,
    transformOrigin: transformOrigin,
    transform: transform,
    transitionProperty: transitionProperty,
    transition: transition.duration + "ms " + transition.timingFunction + " " + transition.delay + "ms"
  }
}

function getPlatform() {
  //var ua = window.navigator.userAgent.toLowerCase();
  return "wechatdevtools"///wechatdevtools/.test(ua) ? "wechatdevtools" : /(iphone|ipad)/.test(ua) ? "ios" : /android/.test(ua) ? "android" : void 0
}

function addPXSuffix(num) {
  return "number" == typeof num ? num + "px" : num
}

function addDegSuffix(num) {
  return num + "deg"
}

class WebviewSdkKnownError extends Error {
  constructor(str) {
    super("Webview-SDK:" + str)
    this.type = "WebviewSdkKnownError"
  }
}

export default {
  getRealRoute,
  animationToStyle,
  getPlatform,
  WebviewSdkKnownError
}