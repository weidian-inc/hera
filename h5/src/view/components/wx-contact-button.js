var MAX_SIZE = 27,
    MIN_SIZE = 18,
    buttonTypes = {
        'default-dark': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFIAAABRCAYAAABBuPE1AAAAAXNSR0IArs4c6QAAA1tJREFUeAHtm89rE0EcxZttbA00ePBc8CLkEEMlNId69uKtWKt/gqRevcejeBNRj/aiKNibHpVST4GQ5gc9F/RYEaE1BNLG9y1ZSNXa3eyb7Ya8hWUmuztv5vuZN9nJTnZqSpsIiIAIiIAIiMB4EEiVSqXLnU7neb/fv4Umz41Hs09t5X4qlfqYyWTK1Wr1+6lXOTiRHkBcdaB9HpJzMMQqYrK678bZAG/gxDjrdF7XecTkIapxH87/6pjYYzKQ2ggEBJIA0SQEUiBJBEgycqRAkgiQZORIgSQRIMnIkQJJIkCSkSMFkkSAJCNHCiSJAElGjhRIEgGSjBxJApkm6SRaJp/P9x008CsW2p41m80nSPty5OiE57E29LhQKDw0CYEcHeRxScB8IJARIQ6KzwskB+SxioY2CaZACiSJAElGjhRIEgGSjBwpkCQCJBk5UiBJBEgycqRAkgiQZORIIsh9klaSZGKPybPXKZJEgNSWD77OwsLCop93mXr2TgpgvkMlsfeig8AshrfZbLbsax8eHq75eZdpKox40LUPdMwv6K61Wq1XYfTZ18KNNwDyM55iX2BrD+u12+2Ui8WvnXQ6fader+8MVxZ3HhCvAuJ71xD9uKgg4cT1mZmZcq1WM0fGvhWLxUtHR0dXer3ebey2KHUxrkZQQEYdykG/Ms6C0u12z7rE2XkGyEQMZWeEAgpHmpDbUJ6dnV087+/DgLE6vWwkR9pQxl7GvwzWnbZujMRDgQS8b4jtB+7K9+TCk70camhPT09fy+Vy1wXxJET7FGpC/ndxzhHWXZvTmvAqNiEP5cjwVUxOCYEk9bVACiSJAElGjhRIEgGSTFIc+YUUT+wy+JGyZZUmAiR+ry+jQW+w/4ydxIgVWluxv8YKw7JJJGJCPmIsIxXD5P8+ADwN+sDXJttBKkqEI4M0lHUNwLyE1k3seyxN05k4kBY01pI28eBlEc5s2mfGNpEgDdz29vYuQC4huyGQEQngeeoB3Lnied4jSEV6O2xiHen3AVzZB9AKHhGuIH/gHw+bTjxIH1ij0djAnXwJMHf9Y2FSgRyihTt6E8vJdhPatMNIPw2d/m9WIP/AgzX5PcC06dELgLS1cW1RCFQqFZksCkCVFQEREAEREIHEEvgNdubEHW4rptkAAAAASUVORK5CYII=',
        'default-light': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFIAAABRCAYAAABBuPE1AAAAAXNSR0IArs4c6QAAAsJJREFUeAHtm71KA0EUhbOijT8o6APY2FgoCFYW9nYK/pSWkvTaig9hrY2iYKmdIOgLWGgrqIUgIpKoIOh6RjMQgpid3bOb3cwZOEyMd86d++UmG3fdUklDBERABERABESgGAQCs80wDIcxbUNzUD9U5FHD5k+gchAET1kVYkEeIOFSVkkzynMIkMsZ5SpZkFUkLHonNjOrAeRA85Np/WxBhmklaKcvQP7Ul8UeurJI4kMOgSS9ygIpkCQCJBt1pECSCJBs1JECSSJAslFHCiSJAMlGHSmQJAIkG3WkQJIIkGzUkQJJIkCyUUcKpBsBXOBLY9zCdB36PRVvMrhtqxjRjZcaUq5xw5trNimDvBNI0ptLBxuBJBEg2agjBZJEgGSjjhRIEgGSjTpSIEkESDbqSIEkESDZqCMFkkSAZKOOJIM0dwJ02si0JtuR5naKThvHtiCci5y2j9Oau+vG5frcKffZGIi2JlNapV5ffiZzpjnieEXcart3jj3MQB8R9xw7zLnOiJmuEDfubE5egD2MQQ8R95wozHnrEbLtIKbX2Zi0ALkHoUloC3qHMhn2M5JRxhtMKrhytxPHzFQbZ11e1rBAXqOgRUA0s5fDfv1JUvwuFk/7DNHAS9KR5q1sbuU1IL0fcUDeg9oztOJ7FzZ2z88/CDQ+0eoxjglDiKkC4merWJffF/1g4wzSBY5LbNFBMg42Lrw6NlYgSS+tQAokiQDJRh0pkCQCJJs8deQFqaZ22JznCeQ8COxDL+0gETOn2eseZPbu38CX/zUo8llz/wg5VAyQs9Aj1HI42PoZCoKj0GUrkn7ScawaEPugo/9gOlr6Gw6IAbQJff0F1F8yMSsHxAWo1gwzpp3fywBxArpphOk3kQTVA+IIdFaHeZrASksBsQfahqZEIyEBQMzTX34Jq9FyERABERABERCBXwLfe8eGVVx752oAAAAASUVORK5CYII='
    }

function _defineProperty (obj, key, value) {
    // 重写e[t]值为n
    key in obj
        ? Object.defineProperty(obj, key, {
        value: value,
        enumerable: !0,
        configurable: !0,
        writable: !0
    })
        : (obj[key] = value)
    return obj
}
// wx-contact-button
export default  window.exparser.registerElement({
    is: 'wx-contact-button',
    behaviors: ['wx-base', 'wx-native'],
    template: '\n    <div id="wrapper" class="wx-contact-button-wrapper">\n    </div>\n  ',
    properties: _defineProperty(
        {
            sessionFrom: {
                type: String,
                value: '',
                public: !0
            },
            type: {
                type: String,
                value: 'default-dark',
                public: !0,
                observer: 'typeChanged'
            },
            size: {
                type: Number,
                value: 36,
                public: !0,
                observer: 'sizeChanged'
            }
        },
        'sessionFrom',
        {
            type: String,
            value: 'wxapp',
            public: !0
        }
    ),
    attached: function () {
        var self = this
        this._isMobile()
        if (1) {
            var url = void 0
            url = buttonTypes[this.type]
                ? buttonTypes[this.type]
                : buttonTypes['default-dark']
            this.$.wrapper.style.backgroundImage = "url('" + url + "')"
            this.$.wrapper.addEventListener('click', function () {
                self._isMobile()
                    ? wx.enterContact({
                    sessionFrom: self.sessionFrom,
                    complete: function (e) {
                        console.log(e)
                    }
                })
                    : alert('进入客服会话，sessionFrom: ' + self.sessionFrom)
            })
        } else {
            this._box = this._getBox()
            console.log('insertContactButton', this._box)
            wx.insertContactButton({
                position: this._box,
                buttonType: this.type,
                sessionFrom: this.sessionFrom,
                complete: function (res) {
                    console.log('insertContactButton complete', res)
                    self.contactButtonId = res.contactButtonId
                    document.addEventListener(
                        'pageReRender',
                        self._pageReRender.bind(self),
                        !1
                    )
                }
            })
        }
    },
    detached: function () {
        this._isMobile(), 1
    },
    sizeChanged: function (e, t) {
        this._box = this._getBox()
        this.$.wrapper.style.width = this._box.width + 'px'
        this.$.wrapper.style.height = this._box.height + 'px'
        this._updateContactButton()
    },
    typeChanged: function (e, t) {
        this._isMobile()
        if (1) {
            var url = void 0
            url = buttonTypes[this.type]
                ? buttonTypes[this.type]
                : buttonTypes['default-dark']
            this.$.wrapper.style.backgroundImage = "url('" + url + "')"
        } else {
            this._updateContactButton()
        }
    },
    _updateContactButton: function () {
        this._isMobile(), 1
    },
    _getBox: function () {
        var pos = this.$.wrapper.getBoundingClientRect(), size = this.size
        typeof size !== 'number' && (size = MIN_SIZE)
        size = size > MAX_SIZE ? MAX_SIZE : size
        size = size < MIN_SIZE ? MIN_SIZE : size
        var res = {
            left: pos.left + window.scrollX,
            top: pos.top + window.scrollY,
            width: size,
            height: size
        }
        return res
    },
    _pageReRender: function () {
        this._updateContactButton()
    }
})

