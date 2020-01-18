import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
Vue.use(VueRouter)
//  重定向
const routes = [
  {
    path: '/',
    redirect: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  },
  {
    path: '/login',
    component: Login
  }
]

const router = new VueRouter({
  routes
})
//  挂载路由导航守卫
router.beforeEach((to, from, next) => {
//  to将要访问的路径
//  from 代表从哪个路径跳转而来
//  next 是一个函数，表示放行
//  next()是放行  next('/login')强制跳转
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
