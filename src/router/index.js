import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Login from '@/components/Login'
import Administration from '@/components/Administration'
import Aide from '@/components/Aide'

Vue.use(Router)

let routes = [
  {
    path: '/',
    name: 'Hello',
    component: Hello
  },
  { path: '/login', component: Login, props: true },
  { path: '/aide', component: Aide }
]

if (process.env.NODE_ENV !== 'production') {
  routes.push({ path: '/administration', component: Administration })
}

export default new Router({
  routes: routes
})
