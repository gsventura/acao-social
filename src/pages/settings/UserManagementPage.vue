<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database.types'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'vue-sonner'

const profiles = ref<Profile[]>([])
const loading = ref(false)

async function fetchProfiles() {
  loading.value = true
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  profiles.value = (data as Profile[]) || []
  loading.value = false
}

async function updateRole(id: string, role: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)

  if (error) {
    toast.error('Erro ao atualizar perfil')
    return
  }

  toast.success('Perfil atualizado')
  await fetchProfiles()
}

onMounted(() => fetchProfiles())
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Gestao de Usuarios</h1>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Cadastrado em</TableHead>
            <TableHead>Alterar Perfil</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="4" class="text-center py-8 text-muted-foreground">
              Carregando...
            </TableCell>
          </TableRow>
          <TableRow v-else-if="profiles.length === 0">
            <TableCell colspan="4" class="text-center py-8 text-muted-foreground">
              Nenhum usuario encontrado
            </TableCell>
          </TableRow>
          <TableRow v-for="p in profiles" :key="p.id">
            <TableCell class="font-medium">
              {{ p.full_name || '(sem nome)' }}
            </TableCell>
            <TableCell>
              <Badge :variant="p.role === 'admin' ? 'default' : 'secondary'">
                {{ p.role === 'admin' ? 'Administrador' : 'Membro' }}
              </Badge>
            </TableCell>
            <TableCell>
              {{ new Date(p.created_at).toLocaleDateString('pt-BR') }}
            </TableCell>
            <TableCell>
              <Select
                :model-value="p.role"
                @update:model-value="updateRole(p.id, $event as string)"
              >
                <SelectTrigger class="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="member">Membro</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
