// wx-touchtrack
export default exparser.registerBehavior({
    is: 'wx-touchtrack',
    touchtrack: function (element, handlerName) {
        var that = this,
            startX = 0,
            startY = 0,
            dx = 0,
            dy = 0,
            handleEvent = function (event, state, x, y) {
                var res = that[handlerName].call(that, {
                    target: event.target,
                    currentTarget: event.currentTarget,
                    preventDefault: event.preventDefault,
                    stopPropagation: event.stopPropagation,
                    detail: {
                        state: state,
                        x: x,
                        y: y,
                        dx: x - startX,
                        dy: y - startY,
                        ddx: x - dx,
                        ddy: y - dy
                    }
                })
                if (res === !1) return !1
            },
            originalEvent = null
        exparser.addListenerToElement(element, 'touchstart', function (event) {
            if (event.touches.length === 1 && !originalEvent) {
                originalEvent = event
                startX = dx = event.touches[0].pageX
                startY = dy = event.touches[0].pageY
                return handleEvent(event, 'start', startX, startY)
            }
        })
        exparser.addListenerToElement(element, 'touchmove', function (event) {
            if (event.touches.length === 1 && originalEvent) {
                var res = handleEvent(
                    event,
                    'move',
                    event.touches[0].pageX,
                    event.touches[0].pageY
                )
                dx = event.touches[0].pageX
                dy = event.touches[0].pageY
                return res
            }
        })
        exparser.addListenerToElement(element, 'touchend', function (event) {
            if (event.touches.length === 0 && originalEvent) {
                originalEvent = null
                return handleEvent(
                    event,
                    'end',
                    event.changedTouches[0].pageX,
                    event.changedTouches[0].pageY
                )
            }
        })
        exparser.addListenerToElement(element, 'touchcancel', function (event) {
            if (event.touches.length === 0 && originalEvent) {
                var t = originalEvent
                originalEvent = null
                return handleEvent(event, 'end', t.touches[0].pageX, t.touches[0].pageY)
            }
        })
    }
})