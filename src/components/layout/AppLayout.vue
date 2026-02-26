<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import AppSidebar from './AppSidebar.vue'
import { LogOut } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.signOut()
  router.push('/auth/login')
}

function getInitials(name: string | undefined) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-12 items-center gap-3 border-b px-4">
        <SidebarTrigger class="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
        <Separator orientation="vertical" class="h-5" />
        <div class="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="rounded-full h-8 w-8">
              <div class="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--stewardship)] text-[11px] font-medium text-primary-foreground">
                {{ getInitials(auth.profile?.full_name) }}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuLabel>
              <div class="font-medium">{{ auth.profile?.full_name }}</div>
              <div class="text-[11px] font-normal text-muted-foreground">
                {{ auth.profile?.role === 'admin' ? 'Administrador' : 'Membro' }}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="handleLogout">
              <LogOut class="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
