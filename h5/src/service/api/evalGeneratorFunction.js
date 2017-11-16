if ("undefined" == typeof navigator) {
    try {
        eval("const GeneratorFunction = Object.getPrototypeOf(function *() {}).constructor; const canvas = new GeneratorFunction('', 'console.log(0)'); canvas().__proto__.__proto__.next = () => {};")
    } catch (e) {
    }
}
