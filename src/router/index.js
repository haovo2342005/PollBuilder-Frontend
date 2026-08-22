import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import CreatePollView from '../views/CreatePollView.vue'
import VoteView from '../views/VoteView.vue'
import ResultsView from '../views/ResultsView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    name: 'create-poll',
    component: CreatePollView
  },
  {
    path: '/poll/:code',
    name: 'vote',
    component: VoteView,
    props: true
  },
  {
    path: '/poll/:code/results',
    name: 'results',
    component: ResultsView,
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
