import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

import mixins from "@/mixins";
Vue.mixin(mixins);

import '@/plugins/axios'

import userModel from "@/models/userModel";
if (userModel.isLogin()) {
  store.commit('authorize/setLogin', true);
  userModel.requestMyInfo();
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
