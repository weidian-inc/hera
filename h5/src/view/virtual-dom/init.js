import Enums from './Enums'
import './Utils'

const initFontSize = function () {
  document.addEventListener(
    'DOMContentLoaded',
    function () {
      let screenWidth = window.innerWidth > 0
        ? window.innerWidth
        : screen.width
      //screenWidth = screenWidth>375?375:screenWidth
      document.documentElement.style.fontSize = screenWidth / Enums.RPX_RATE + 'px'
    },
    1e3
  )
}

const init = function () {
  window.__webview_engine_version__ = 0.02
  initFontSize()
}

export default {init}