import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/pages/auth/CallbackPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard/DashboardPage.vue'),
      },
      {
        path: 'inventory',
        name: 'InventoryList',
        component: () => import('@/pages/inventory/InventoryListPage.vue'),
      },
      {
        path: 'inventory/new',
        name: 'InventoryNew',
        component: () => import('@/pages/inventory/InventoryFormPage.vue'),
      },
      {
        path: 'inventory/:id/edit',
        name: 'InventoryEdit',
        component: () => import('@/pages/inventory/InventoryFormPage.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'beneficiaries',
        name: 'BeneficiaryList',
        component: () => import('@/pages/beneficiaries/BeneficiaryListPage.vue'),
      },
      {
        path: 'beneficiaries/new',
        name: 'BeneficiaryNew',
        component: () => import('@/pages/beneficiaries/BeneficiaryFormPage.vue'),
      },
      {
        path: 'beneficiaries/:id/edit',
        name: 'BeneficiaryEdit',
        component: () => import('@/pages/beneficiaries/BeneficiaryFormPage.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'movements',
        name: 'MovementList',
        component: () => import('@/pages/movements/MovementListPage.vue'),
      },
      {
        path: 'movements/new',
        name: 'MovementNew',
        component: () => import('@/pages/movements/MovementFormPage.vue'),
      },
      {
        path: 'settings/webhooks',
        name: 'WebhookSettings',
        component: () => import('@/pages/settings/WebhookSettingsPage.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'settings/users',
        name: 'UserManagement',
        component: () => import('@/pages/settings/UserManagementPage.vue'),
        meta: { requiresAdmin: true },
      },
    ],
  },
]
