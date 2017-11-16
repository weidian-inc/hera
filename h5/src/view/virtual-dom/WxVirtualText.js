class wxVirtualText {
  constructor (txt) {
    this.text = String(txt)
  }

  render (global) {
    const parser = global ? global.document || exparser : exparser
    return parser.createTextNode(this.text)
  }
}

wxVirtualText.prototype.type = 'WxVirtualText'

export default wxVirtualText
