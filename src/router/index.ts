import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

let initialized = false

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!initialized) {
    await auth.initialize()
    initialized = true
  }

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth !== false)
  const requiresAdmin = to.matched.some((r) => r.meta.requiresAdmin)

  if (requiresAuth && !auth.isAuthenticated) {
    return { name: 'Login' }
  }

  if (requiresAdmin && !auth.isAdmin) {
    return { name: 'Dashboard' }
  }

  if (to.name === 'Login' && auth.isAuthenticated) {
    return { name: 'Dashboard' }
  }
})

export default router
