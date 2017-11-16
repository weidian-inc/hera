// 小程序service 接口api 导出
import pageInit from './pageInit'
import initApp from './initApp'

window.Page = pageInit.pageHolder
window.App = initApp.appHolder
window.getApp = initApp.getApp
window.getCurrentPages = pageInit.getCurrentPages
