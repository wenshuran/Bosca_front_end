import Vue from 'vue'
import Router from 'vue-router'
import Login from "../components/Login";
import Manage1 from "../components/Manage1";
import SignUp from "../components/SignUp";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/signUp',
      name: 'SignUp',
      component: SignUp
    },
    {
      path: '/',
      name: 'Manage',
      component: Manage1,
      // meta: {
      //   requireAuth: true,//only for debug
      // }
    }
  ]
})
