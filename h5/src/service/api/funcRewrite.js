// rewrite Function adn SetTimeout setInterval

(function (exports) {

    require('./bridge')
/*
    if ("undefined" != typeof Function) {
        Function;
        e = {},
            Function.constructor = function () {
            },
            Function.prototype.constructor = function () {
            },
            Function = function () {
                if (arguments.length > 0 && "return this" === arguments[arguments.length - 1])
                    return function () {
                        return e
                    }
            },
            Object.defineProperty(Function.constructor.__proto__, "apply", {
                writable: !1,
                configurable: !1,
                value: Function.prototype.constructor.apply
            })
    }
*/
    var userAgent = window.navigator.userAgent
    var isAndroid = userAgent.indexOf('Android') !== -1
    var isIOS = !isAndroid
    if (isIOS) {
        // iOS setTimeOut需要特别处理
        var callbackId = 0
        var callbacks = {}
        ServiceJSBridge.on('onSetTimeout', function (params, webviewId) {
            if (typeof callbacks[params.callbackId] === 'function') {
            callbacks[params.callbackId]()
            }
        }, 'onSetTimeout')
        ServiceJSBridge.on('onSetInterval', function (params, webviewId) {
            if (typeof callbacks[params.callbackId] === 'function') {
            callbacks[params.callbackId]()
            }
        }, 'onSetInterval')

        window.setTimeout = function (fn, timer) {
            const id = callbackId++
            callbacks[id] = fn
            ServiceJSBridge.publish('setTimeout', {timer: timer, callbackId: id}, '')
            return id
        }
        window.setInterval = function (fn, timer) {
            const id = callbackId++
            callbacks[id] = fn
            ServiceJSBridge.publish('setInterval', {timer: timer, callbackId: id}, '')
            return id
        }
        window.clearTimeout = function (timerId) {
            ServiceJSBridge.publish('clearTimeout', timerId, '')
        }
    } else {
        var originalSetTimeOut = setTimeout
        window.setTimeout = function (fn, timer) {
            if (typeof fn !== 'function') {
            throw new TypeError('setTimetout expects a function as first argument but got ' + typeof (fn) + '.')
            }
            var callback = Reporter.surroundThirdByTryCatch(fn, 'at setTimeout callback function')
            return originalSetTimeOut(callback, timer)
        }
        var originalSetInterval = setInterval
        window.setInterval = function (fn, timer) {
            if (typeof fn !== 'function') {
            throw new TypeError('setInterval expects a function as first argument but got ' + typeof (fn) + '.')
            }
            Reporter.surroundThirdByTryCatch(fn, 'at setInterval callback function')
            return originalSetInterval(fn, timer)
        }
    }
}).call(exports, function () { return this }())
