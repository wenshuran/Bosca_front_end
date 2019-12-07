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
export const SETROOT = 'SETROOT';

var store = new Vuex.Store({
  state:{
    username:'',
    jwtoken:'',
    userid:'',
    rootdir:''
  },
  mutations:{
    [LOGIN](state, payload){
      cookies.set('jwtoken', payload.token);
      cookies.set("userid", payload.user);
      state.jwtoken = payload.token;
      state.userid = payload.user;
    },
    [LOGOUT](state){
      cookies.remove("jwtoken");
      cookies.remove("userid");
      cookies.remove("rootdir");
      state.jwtoken = '';
      state.userid = '';
      state.rootdir = '';
    },
    [SETROOT](state, root){
      state.rootdir = root;
      cookies.set("rootdir", root);
    },
    autoLogin(state){
      if (cookies.isKey("jwtoken") && cookies.isKey("userid") && cookies.isKey("rootdir")){
        state.jwtoken = cookies.get("jwtoken");
        state.userid = cookies.get("userid");
        state.rootdir = cookies.get("root");
        return true;
      }
      else
        return false;
    }
  },
  getters:{
    jwtoken:state => {
      if (state.jwtoken !== '')
        return state.jwtoken;
      else if (cookies.get('jwtoken') !== '')
        return cookies.get('jwtoken');
      else
        return null;
    },
    userid:state => {
      if (state.userid !== '')
        return state.userid;
      else if (cookies.get('userid') !== '')
        return cookies.get('userid');
      else
        return null;
    },
    rootdir: state => {
      if (state.rootdir !== '')
        return state.rootdir;
      else if (cookies.get('rootdir') !== '')
        return cookies.get('rootdir');
      else
        return null;
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
    value.headers.Authorization = 'Bearer ' + store.getters.jwtoken;
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
