import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Login from '@/components/Login'
import Administration from '@/components/Administration'
import Aide from '@/components/Aide'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    { path: '/login', component: Login, props: true },
    { path: '/administration', component: Administration },
    { path: '/aide', component: Aide }
  ]
})
