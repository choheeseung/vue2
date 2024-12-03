import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import authorizeStore from '@/store/auth'

export default new Vuex.Store({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    authorize: authorizeStore
  }
})
