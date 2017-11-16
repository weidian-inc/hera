
var isDevTools = function() {
  return true
};
var addHtmlSuffixToUrl = function(url) {//给url增加.html后缀
  if ("string" != typeof url) {
    return url;
  }
  var uri = url.split("?")[0],
      query = url.split("?")[1];
  uri += ".html";
  if ("undefined" != typeof query) {
    return uri + "?" + query;
  } else {
    return uri;
  }
};
var removeHtmlSuffixFromUrl = function(url) {//去除url后面的.html
  if ("string" == typeof url && url.indexOf(".html") === url.length - 4) {
    return  url.substring(0, url.length - 5);
  } else {
    return url;
  }
};

var hasOwnProperty = Object.prototype.hasOwnProperty;

var toString = Object.prototype.toString;
class AppServiceEngineKnownError extends Error {
  constructor(e) {
    super("APP-SERVICE-Engine:" + e);
    this.type = "AppServiceEngineKnownError";
  }
}
var pageEngine = {
  getPlatform:function () {//get platform
    return "devtools";
  },
  safeInvoke: function() {//do page method
    var res = void 0,
        args = Array.prototype.slice.call(arguments),
        fn = args[0];
    args = args.slice(1);
    try {
      var startTime = Date.now();
      res = this[fn].apply(this, args);
      var doTime = Date.now() - startTime;
      doTime > 1e3 && Reporter.slowReport({
        key: "pageInvoke",
        cost: doTime,
        extend: "at " + this.__route__ + " page " + fn + " function"
      });
    } catch(e) {
      Reporter.thirdErrorReport({
        error: e,
        extend: 'at "' + this.__route__ + '" page ' + fn + " function"
      });
    }
    return res;
  },
  isEmptyObject:function(obj) {
    for (var t in obj) {
      if (obj.hasOwnProperty(t)) {
        return false;
      }
    }
    return true;
  },
  extend:function(target, obj) {
    for (var keys = Object.keys(obj), o = keys.length; o--;) {
      target[keys[o]] = obj[keys[o]];
    }
    return target;
  },
  noop:function() {},
  getDataType:function(param) {
    return Object.prototype.toString.call(param).split(" ")[1].split("]")[0];
  },
  isObject:function(param) {
    return null !== param && "object" === typeof(param)
  },
  hasOwn:function(obj, attr) {
    return hasOwnProperty.call(obj, attr);
  },
  def:function(obj, attr, value, enumerable) {
    Object.defineProperty(obj, attr, {
      value: value,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    })
  },
  isPlainObject:function(e) {
    return toString.call(e) === "[object Object]";
  },
  error:function(title, err) {
    console.group(new Date + " " + title);
    console.error(err);
    console.groupEnd();
  },
  warn:function(title, warn) {
    console.group(new Date + " " + title);
    console.warn(warn);
    console.groupEnd();
  },
  info:function(msg) {
    __wxConfig__ && __wxConfig__.debug && console.info(msg);
  },
  surroundByTryCatch: function(fn, extend) {
    var self = this;
    return function() {
      try {
        return fn.apply(fn, arguments);
      } catch(e) {
        self.errorReport(e, extend);
        return function() {};

      }
    }
  },
  errorReport:function(err, extend) {//d
    if ("[object Error]" === Object.prototype.toString.apply(err)) {
      if ("AppServiceEngineKnownError" === err.type) {
        throw err;
      }
      Reporter.errorReport({
        key: "jsEnginScriptError",
        error: err,
        extend: extend
      });
    }
  },
  publish:function() {
    var params = Array.prototype.slice.call(arguments),
        defaultOpt = {
          options: {
            timestamp: Date.now()
          }
        };
    params[1] ? params[1].options = this.extend(params[1].options || {},defaultOpt.options) : params[1] = defaultOpt;
    ServiceJSBridge.publish.apply(ServiceJSBridge, params);
  },
  AppServiceEngineKnownError:AppServiceEngineKnownError
}

// export default Object.assi{},{},pageEngine,htmlSuffix);
export default {
  ...pageEngine,
  isDevTools,
  addHtmlSuffixToUrl,
  removeHtmlSuffixFromUrl
}