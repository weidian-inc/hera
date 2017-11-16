/* eslint-disable no-unused-vars */
import 'es6-promise/auto'
import 'regenerator-runtime/runtime'
import Vue from 'vue'
import VueRouter from 'vue-router'
import route from './router/index.js'
import Index from './components/Index.vue'

import './assets/reset.css'
import './assets/js/highlight/styles/default.css'

Vue.use(VueRouter)

const router = new VueRouter(route)
new Vue({
  el: '#app',
  router: router,
  render(h) {
    return <Index />
  }
})
