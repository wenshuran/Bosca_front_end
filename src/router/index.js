import Vue from 'vue'
import Router from 'vue-router'
import Login from "../components/Login";
import Manage from "../components/Manage";
import SignUp from "../components/SignUp";

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/signUp',
      name: 'SignUp',
      component: SignUp
    },
    {
      path: '/manage',
      name: 'Manage',
      component: Manage,
      meta: {
        requireAuth: true,//only for debug
      }
    }
  ]
})
