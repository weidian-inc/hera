// wx-player
export default window.exparser.registerBehavior({
    is: 'wx-player',
    isBackground: !1,
    properties: {
        src: {
            type: String,
            observer: 'srcChanged',
            public: !0
        },
        poster: {
            type: String,
            observer: 'posterChanged',
            public: !0
        },
        playing: {
            type: Boolean,
            value: !1
        },
        _buttonType: {
            type: String,
            value: 'play'
        },
        _currentTime: {
            type: String,
            value: '00:00'
        },
        _duration: {
            type: String,
            value: '00:00'
        },
        isLive: {
            type: Boolean,
            value: !1
        }
    },
    _formatTime: function (time) {
        if (time === 1 / 0) return '00:00'
        var hour = Math.floor(time / 3600),
            min = Math.floor((time - 3600 * hour) / 60),
            sencod = time - 3600 * hour - 60 * min
        return hour == 0
            ? (min >= 10 ? min : '0' + min) +
            ':' +
            (sencod >= 10 ? sencod : '0' + sencod)
            : (hour >= 10 ? hour : '0' + hour) +
            ':' +
            (min >= 10 ? min : '0' + min) +
            ':' +
            (sencod >= 10 ? sencod : '0' + sencod)
    },
    _publish: function (eventName, param) {
        this.triggerEvent(eventName, param)
    },
    attached: function () {
        var self = this, playDom = this.$.player, tmpObj = {}
        for (var o in MediaError) {
            tmpObj[MediaError[o]] = o
        }
        playDom.onerror = function (event) {
            event.stopPropagation()
            if (event.srcElement.error) {
                var t = event.srcElement.error.code
                self._publish('error', {
                    errMsg: tmpObj[t]
                })
            }
        }
        playDom.onplay = function (event) {
            self.playing = !0
            event.stopPropagation()
            self._publish('play', {})
            self._buttonType = 'pause'
            typeof self.onPlay === 'function' && self.onPlay(event)
        }
        playDom.onpause = function (event) {
            self.playing = !1
            event.stopPropagation()
            self._publish('pause', {})
            self._buttonType = 'play'
            typeof self.onPause === 'function' && self.onPause(event)
        }
        playDom.onended = function (event) {
            self.playing = !1
            event.stopPropagation()
            self._publish('ended', {})
            typeof self.onEnded === 'function' && self.onEnded(event)
        }
        playDom.tagName == 'AUDIO' &&
        (playDom.onratechange = function (event) {
            event.stopPropagation()
            self._publish('ratechange', {
                playbackRate: playDom.playbackRate
            })
        })
        var prevTime = 0
        playDom.addEventListener('timeupdate', function (event) {
            event.stopPropagation()
            Math.abs(playDom.currentTime - prevTime) % playDom.duration >= 1 &&
            (self._publish('timeupdate', {
                currentTime: playDom.currentTime,
                duration: playDom.duration
            }), (prevTime = 1e3 * playDom.currentTime))
            self._currentTime = self._formatTime(Math.floor(playDom.currentTime))
            typeof self.onTimeUpdate === 'function' && self.onTimeUpdate(event)
        })
        playDom.addEventListener('durationchange', function () {
            playDom.duration === 1 / 0 ? (self.isLive = !0) : (self.isLive = !1)
            NaN !== playDom.duration &&
            self.duration === 0 &&
            (self._duration = self._formatTime(Math.floor(playDom.duration)))
        })
    }
})