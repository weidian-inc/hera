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
    // "undefined" != typeof eval && (eval = void 0),
    "undefined" != typeof navigator && !function () {
        var originalSetTimeOut = setTimeout;
        window.setTimeout = function (fn, timer) {
            if ("function" != typeof fn) {
                throw new TypeError("setTimetout expects a function as first argument but got " + typeof(fn) + ".");
            }
            var callback = Reporter.surroundThirdByTryCatch(fn, "at setTimeout callback function");
            return originalSetTimeOut(callback, timer)
        };
        var originalSetInterval = setInterval;
        window.setInterval = function (fn, timer) {
            if ("function" != typeof fn) {
                throw new TypeError("setInterval expects a function as first argument but got " + typeof(fn) + ".");
            }
            Reporter.surroundThirdByTryCatch(fn, "at setInterval callback function");
            return originalSetInterval(fn, timer)
        }
    }()
}).call(exports, function () { return this }())
