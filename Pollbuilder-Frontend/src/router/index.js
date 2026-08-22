import { createRouter, createWebHistory } from 'vue-router'
import CreatePollView from '../views/CreatePollView.vue'
import VoteView from '../views/VoteView.vue'
import ResultsView from '../views/ResultsView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import MyPollsView from '../views/MyPollsView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import { isAuthenticated } from '../auth/session'

const routes = [
  {
    path: '/',
    name: 'create-poll',
    component: CreatePollView,
    meta: { requiresAuth: true }
  },
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
    path: '/my-polls',
    name: 'my-polls',
    component: MyPollsView,
    meta: { requiresAuth: true }
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

// Creating/managing polls requires an account; voting and viewing
// results stay open to anyone with the link (no login needed).
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
