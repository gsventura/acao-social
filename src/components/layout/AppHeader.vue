<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

function getInitials(name: string | undefined) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

async function handleLogout() {
  await auth.signOut()
  router.push('/auth/login')
}
</script>

<template>
  <header class="flex h-14 items-center gap-3 border-b px-4">
    <SidebarTrigger />
    <Separator orientation="vertical" class="h-6" />
    <div class="flex-1" />

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon" class="rounded-full">
          <Avatar class="h-8 w-8">
            <AvatarFallback class="text-xs">
              {{ getInitials(auth.profile?.full_name) }}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-48">
        <DropdownMenuLabel>
          <div>{{ auth.profile?.full_name }}</div>
          <div class="text-xs font-normal text-muted-foreground">
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
</template>
