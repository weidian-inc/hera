import utils from './utils';

class Animation {
    constructor(...options) {
        const option = options[0]
        this.actions = []
        this.currentTransform = []
        this.currentStepAnimates = []
        this.option = {
            transition: {
                duration: typeof option.duration !== 'undefined' ? option.duration : 400,
                timingFunction: typeof option.timingFunction !== 'undefined' ? option.timingFunction : 'linear',
                delay: typeof option.delay !== 'undefined' ? option.delay : 0
            },
            transformOrigin: option.transformOrigin || '50% 50% 0'
        }
    }

    export() {
        var temp = this.actions
        this.actions = []
        return {actions: temp}
    }

    step() {
        var that = this,
            params = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}

        this.currentStepAnimates.forEach(function (animate) {
            animate.type !== 'style' ? that.currentTransform[animate.type] = animate : that.currentTransform[animate.type + '.' + animate.args[0]] = animate
        })
        this.actions.push({
            animates: Object.keys(this.currentTransform).reduce(function (res, cur) {
                return [].concat(utils.toArray(res), [that.currentTransform[cur]])
            }, []),
            option: {
                transformOrigin: typeof params.transformOrigin !== 'undefined' ? params.transformOrigin : this.option.transformOrigin,
                transition: {
                    duration: typeof params.duration !== 'undefined' ? params.duration : this.option.transition.duration,
                    timingFunction: typeof params.timingFunction !== 'undefined' ? params.timingFunction : this.option.transition.timingFunction,
                    delay: typeof params.delay !== 'undefined' ? params.delay : this.option.transition.delay
                }
            }
        })
        this.currentStepAnimates = []
        return this
    }

    matrix() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1,
            t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
            n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0,
            o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 1,
            r = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : 1,
            i = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : 1
        this.currentStepAnimates.push({
            type: 'matrix',
            args: [e, t, n, o, r, i]
        })
        return this
    }

    matrix3d() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1,
            t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
            n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0,
            o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 0,
            r = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : 0,
            i = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : 1,
            a = arguments.length > 6 && void 0 !== arguments[6] ? arguments[6] : 0,
            s = arguments.length > 7 && void 0 !== arguments[7] ? arguments[7] : 0,
            c = arguments.length > 8 && void 0 !== arguments[8] ? arguments[8] : 0,
            u = arguments.length > 9 && void 0 !== arguments[9] ? arguments[9] : 0,
            f = arguments.length > 10 && void 0 !== arguments[10] ? arguments[10] : 1,
            l = arguments.length > 11 && void 0 !== arguments[11] ? arguments[11] : 0,
            d = arguments.length > 12 && void 0 !== arguments[12] ? arguments[12] : 0,
            p = arguments.length > 13 && void 0 !== arguments[13] ? arguments[13] : 0,
            h = arguments.length > 14 && void 0 !== arguments[14] ? arguments[14] : 0,
            v = arguments.length > 15 && void 0 !== arguments[15] ? arguments[15] : 1
        this.currentStepAnimates.push({
            type: 'matrix3d',
            args: [e, t, n, o, r, i, a, s, c, u, f, l, d, p, h, v]
        })
        this.stepping = !1
        return this
    }

    rotate() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
        this.currentStepAnimates.push({
            type: 'rotate',
            args: [e]
        })
        return this
    }

    rotate3d() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
            t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
            n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0,
            o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 0
        this.currentStepAnimates.push({
            type: 'rotate3d',
            args: [e, t, n, o]
        })
        this.stepping = !1
        return this
    }

    rotateX() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
        this.currentStepAnimates.push({
            type: 'rotateX',
            args: [e]
        })
        this.stepping = !1
        return this
    }

    rotateY() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
        this.currentStepAnimates.push({
            type: 'rotateY',
            args: [e]
        })
        this.stepping = !1
        return this
    }

    rotateZ() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
        this.currentStepAnimates.push({
            type: 'rotateZ',
            args: [e]
        })
        this.stepping = !1
        return this
    }

    scale() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1,
            t = arguments[1]
        t = typeof t !== 'undefined' ? t : e
        this.currentStepAnimates.push({
            type: 'scale',
            args: [e, t]
        })
        return this
    }

    scale3d() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1,
            t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1,
            n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1
        this.currentStepAnimates.push({
            type: 'scale3d',
            args: [e, t, n]
        })
        return this
    }

    scaleX() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1
        this.currentStepAnimates.push({
            type: 'scaleX',
            args: [e]
        })
        return this
    }

    scaleY() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1
        this.currentStepAnimates.push({
            type: 'scaleY',
            args: [e]
        })
        return this
    }

    scaleZ() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1
        this.currentStepAnimates.push({
            type: 'scaleZ',
            args: [e]
        })
        return this
    }

    skew() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
            t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
        this.currentStepAnimates.push({
            type: 'skew',
            args: [e, t]
        })
        return this
    }

    skewX() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
        this.currentStepAnimates.push({
            type: 'skewX',
            args: [e]
        })
        return this
    }

    skewY() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
        this.currentStepAnimates.push({
            type: 'skewY',
            args: [e]
        })
        return this
    }

    translate() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
            t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
        this.currentStepAnimates.push({
            type: 'translate',
            args: [e, t]
        })
        return this
    }

    translate3d() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
            t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
            n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0
        this.currentStepAnimates.push({
            type: 'translate3d',
            args: [e, t, n]
        })
        return this
    }

    translateX() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
        this.currentStepAnimates.push({
            type: 'translateX',
            args: [e]
        })
        return this
    }

    translateY() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
        this.currentStepAnimates.push({
            type: 'translateY',
            args: [e]
        })
        return this
    }

    translateZ() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
        this.currentStepAnimates.push({
            type: 'translateZ',
            args: [e]
        })
        return this
    }

    opacity(e) {
        this.currentStepAnimates.push({
            type: 'style',
            args: ['opacity', e]
        })
        return this
    }

    backgroundColor(e) {
        this.currentStepAnimates.push({
            type: 'style',
            args: ['backgroundColor', e]
        })
        return this
    }

    width(e) {
        typeof e === 'number' && (e += 'px')
        this.currentStepAnimates.push({
            type: 'style',
            args: ['width', e]
        })
        return this
    }

    height(e) {
        typeof e === 'number' && (e += 'px')
        this.currentStepAnimates.push({
            type: 'style',
            args: ['height', e]
        })
        return this
    }

    left(e) {
        typeof e === 'number' && (e += 'px')
        this.currentStepAnimates.push({
            type: 'style',
            args: ['left', e]
        })
        return this
    }

    right(e) {
        typeof e === 'number' && (e += 'px')
        this.currentStepAnimates.push({
            type: 'style',
            args: ['right', e]
        })
        return this
    }

    top(e) {
        typeof e === 'number' && (e += 'px')
        this.currentStepAnimates.push({
            type: 'style',
            args: ['top', e]
        })
        return this
    }

    bottom(e) {
        typeof e === 'number' && (e += 'px')
        this.currentStepAnimates.push({
            type: 'style',
            args: ['bottom', e]
        })
        return this
    }

}

export default Animation
