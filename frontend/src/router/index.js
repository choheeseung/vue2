import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import AuthorizeRoutes from './authorize.routes';
import MyPageRoutes from './my.routes';
import BoardRoutes from './board.routes';
import AgreementRoutes from './agreement.routes';


const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ '../views/HomeView.vue')
  },
    ...AuthorizeRoutes,
    ...MyPageRoutes,
    ...BoardRoutes,
    ...AgreementRoutes,
  {
    path: '*',
    name: 'Error404',
    component: () => import(/* webpackChunkName: "error404" */ '../views/Errors/Error404.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
