// wx-data-Component
export default window.exparser.registerBehavior({
    is: 'wx-data-Component',
    properties: {
        name: {
            type: String,
            public: !0
        }
    },
    getFormData: function () {
        return this.value || ''
    },
    resetFormData: function () {}
})