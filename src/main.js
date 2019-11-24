// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import view from 'iview'
import axios from 'axios'
import Vuex from 'vuex'
import cookies from 'vue-cookies'
import ElementUI from 'element-ui'
import './style/theme/index.css'

Vue.config.productionTip = false;
Vue.prototype.$http = axios;
Vue.use(Vuex);
Vue.use(cookies);
Vue.use(ElementUI);

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

var store = new Vuex.Store({
  state:{
    username:'',
    jwtoken:'',
  },
  mutations:{
    [LOGIN](state, token){
        cookies.set("jwtoken", token);
      console.log(cookies.keys())
      state.jwtoken = token;
    },
    [LOGOUT](state){
      cookies.remove("jwtoken");
      state.jwtoken = '';
    },
    autoLogin(state){
      if (cookies.isKey("jwtoken")){
        state.jwtoken = cookies.get("jwtoken");
        return true;
      }
      else
        return false;
    }
  },
  getters:{
    jwtoken:state => {
      return state.jwtoken;
    }
  }
});

router.beforeEach((to, from, next) => {
  //iview.loadin
  if (to.meta.requireAuth){
    if (store.getters.jwtoken){
      next();
    }
    else if (cookies.isKey("jwtoken")){
      store.commit('autoLogin');
      next();
    }
    else {
      next({
        path: '/login',
        query: {redirect: to.fullPath},
      })
    }
  }
  else {
    next();
  }
});

router.afterEach(to => {
  //iview.loading().start();
});

axios.interceptors.request.use(value => {
  if (store.getters.jwtoken){
    value.headers.Authorization = store.getters.jwtoken;
  }
  return value;
},error => {
  return Promise.reject(error);
});

export default store;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
