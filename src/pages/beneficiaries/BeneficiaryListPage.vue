<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBeneficiaries } from '@/composables/useBeneficiaries'
import { maskDocument } from '@/lib/masks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const auth = useAuthStore()
const { beneficiaries, loading, fetchBeneficiaries, deleteBeneficiary } =
  useBeneficiaries()

const search = ref('')
const typeFilter = ref<string>('')

const typeLabels: Record<string, string> = {
  familia: 'Família',
  organizacao: 'Instituição',
}

async function handleFilter() {
  await fetchBeneficiaries({
    type: typeFilter.value === 'all' ? undefined : typeFilter.value || undefined,
    search: search.value || undefined,
  })
}

async function handleDelete(id: string) {
  if (!confirm('Tem certeza que deseja excluir este beneficiário?')) return
  const { error } = await deleteBeneficiary(id)
  if (error) {
    toast.error('Erro ao excluir beneficiário')
    return
  }
  toast.success('Beneficiário excluído')
  await fetchBeneficiaries()
}

onMounted(() => fetchBeneficiaries())
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight">Beneficiários</h1>
        <p class="text-sm text-muted-foreground">Famílias e instituições atendidas</p>
      </div>
      <RouterLink to="/beneficiaries/new">
        <Button>
          <Plus class="mr-2 h-4 w-4" />
          Novo Beneficiário
        </Button>
      </RouterLink>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row">
      <Input
        v-model="search"
        placeholder="Buscar por nome..."
        class="sm:max-w-xs"
        @keyup.enter="handleFilter"
      />
      <Select v-model="typeFilter" @update:model-value="handleFilter">
        <SelectTrigger class="sm:w-48">
          <SelectValue placeholder="Todos os tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="familia">Família</SelectItem>
          <SelectItem value="organizacao">Instituição</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" @click="handleFilter">Filtrar</Button>
    </div>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead v-if="auth.isAdmin">Documento</TableHead>
            <TableHead v-if="auth.isAdmin">Contato</TableHead>
            <TableHead>Responsavel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead v-if="auth.isAdmin" class="text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell :colspan="auth.isAdmin ? 7 : 4" class="text-center py-8 text-muted-foreground">
              Carregando...
            </TableCell>
          </TableRow>
          <TableRow v-else-if="beneficiaries.length === 0">
            <TableCell :colspan="auth.isAdmin ? 7 : 4" class="text-center py-8 text-muted-foreground">
              Nenhum beneficiário encontrado
            </TableCell>
          </TableRow>
          <TableRow v-for="b in beneficiaries" :key="b.id">
            <TableCell class="font-medium">{{ b.name }}</TableCell>
            <TableCell>
              <Badge :variant="b.type === 'familia' ? 'default' : 'secondary'">
                {{ typeLabels[b.type] }}
              </Badge>
            </TableCell>
            <TableCell v-if="auth.isAdmin" class="font-mono text-sm text-muted-foreground">
              {{ b.document ? maskDocument(b.document) : '—' }}
            </TableCell>
            <TableCell v-if="auth.isAdmin" class="text-muted-foreground">
              {{ b.contact_info || '—' }}
            </TableCell>
            <TableCell class="text-muted-foreground">{{ b.responsible_person || '—' }}</TableCell>
            <TableCell>
              <Badge :variant="b.active ? 'default' : 'outline'">
                {{ b.active ? 'Ativo' : 'Inativo' }}
              </Badge>
            </TableCell>
            <TableCell v-if="auth.isAdmin" class="text-right">
              <div class="flex justify-end gap-1">
                <RouterLink :to="`/beneficiaries/${b.id}/edit`">
                  <Button variant="ghost" size="icon">
                    <Pencil class="h-4 w-4" />
                  </Button>
                </RouterLink>
                <Button
                  variant="ghost"
                  size="icon"
                  @click="handleDelete(b.id)"
                >
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
