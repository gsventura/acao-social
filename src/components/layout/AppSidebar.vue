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
  { title: 'Beneficiários', icon: Users, to: '/beneficiaries' },
  { title: 'Movimentações', icon: Truck, to: '/movements' },
]

const adminNav = [
  { title: 'Webhooks', icon: Webhook, to: '/settings/webhooks' },
  { title: 'Usuários', icon: UserCog, to: '/settings/users' },
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
    <SidebarHeader class="border-b border-sidebar-border px-4 py-3">
      <div class="flex items-center gap-3">
        <img src="/logotop.png" alt="Logo" class="h-9 w-9" />
        <div class="flex flex-col">
          <span class="text-sm font-semibold text-sidebar-foreground leading-tight">Diaconia</span>
          <span class="text-[11px] text-muted-foreground leading-tight">IPM Campinas</span>
        </div>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel class="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in mainNav" :key="item.to">
              <SidebarMenuButton
                :class="[
                  isActive(item.to)
                    ? 'border-l-2 border-l-[var(--stewardship)] bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'border-l-2 border-l-transparent'
                ]"
                :tooltip="item.title"
                @click="navigate(item.to)"
              >
                <component :is="item.icon" class="shrink-0" />
                <span>{{ item.title }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup v-if="auth.isAdmin">
        <SidebarGroupLabel class="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Configurações</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in adminNav" :key="item.to">
              <SidebarMenuButton
                :class="[
                  isActive(item.to)
                    ? 'border-l-2 border-l-[var(--stewardship)] bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'border-l-2 border-l-transparent'
                ]"
                :tooltip="item.title"
                @click="navigate(item.to)"
              >
                <component :is="item.icon" class="shrink-0" />
                <span>{{ item.title }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="border-t border-sidebar-border px-4 py-3">
      <div class="flex items-center gap-2.5">
        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--stewardship)] text-[11px] font-medium text-primary-foreground">
          {{ auth.profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?' }}
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-medium text-sidebar-foreground leading-tight">{{ auth.profile?.full_name }}</span>
          <span class="text-[11px] text-muted-foreground leading-tight">{{ auth.profile?.role === 'admin' ? 'Administrador' : 'Membro' }}</span>
        </div>
      </div>
    </SidebarFooter>
  </Sidebar>
</template>
