<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  Webhook,
  UserCog
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const mainNav = [
  { title: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { title: 'Estoque', icon: Package, to: '/inventory' },
  { title: 'Beneficiarios', icon: Users, to: '/beneficiaries' },
  { title: 'Movimentacoes', icon: Truck, to: '/movements' },
]

const adminNav = [
  { title: 'Webhooks', icon: Webhook, to: '/settings/webhooks' },
  { title: 'Usuarios', icon: UserCog, to: '/settings/users' },
]

function isActive(path: string) {
  return route.path.startsWith(path)
}

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <Sidebar>
    <SidebarHeader class="border-b px-4 py-2">
      <div class="flex items-center justify-center overflow-hidden">
        <img src="/logo.png" alt="Logo" class="h-20 w-auto object-contain" />
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in mainNav" :key="item.to">
              <SidebarMenuButton
                :data-active="isActive(item.to)"
                :tooltip="item.title"
                @click="navigate(item.to)"
              >
                <component :is="item.icon" />
                <span>{{ item.title }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup v-if="auth.isAdmin">
        <SidebarGroupLabel>Configuracoes</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in adminNav" :key="item.to">
              <SidebarMenuButton
                :data-active="isActive(item.to)"
                :tooltip="item.title"
                @click="navigate(item.to)"
              >
                <component :is="item.icon" />
                <span>{{ item.title }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="border-t p-4">
      <div class="text-xs text-muted-foreground">
        {{ auth.profile?.full_name }}
      </div>
    </SidebarFooter>
  </Sidebar>
</template>
