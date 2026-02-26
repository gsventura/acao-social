<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useInventory } from '@/composables/useInventory'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Trash2, Image } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const auth = useAuthStore()
const { items, loading, fetchItems, deleteItem } = useInventory()

const search = ref('')
const categoryFilter = ref<string>('')
const photoPreview = ref<string | null>(null)

const categoryLabels: Record<string, string> = {
  alimento: 'Alimento',
  roupa: 'Roupa',
  movel: 'Móvel',
  financeiro: 'Financeiro',
}

function getCategoryVariant(category: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    alimento: 'default',
    roupa: 'secondary',
    movel: 'outline',
    financeiro: 'destructive',
  }
  return variants[category] || 'default'
}

function isExpiringSoon(date: string | null) {
  if (!date) return false
  const expiry = new Date(date)
  const now = new Date()
  const diff = expiry.getTime() - now.getTime()
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
}

function isExpired(date: string | null) {
  if (!date) return false
  return new Date(date) < new Date()
}

async function handleFilter() {
  await fetchItems({
    category: categoryFilter.value === 'all' ? undefined : categoryFilter.value || undefined,
    search: search.value || undefined,
  })
}

async function handleDelete(id: string) {
  if (!confirm('Tem certeza que deseja excluir este item?')) return
  const { error } = await deleteItem(id)
  if (error) {
    toast.error('Erro ao excluir item')
    return
  }
  toast.success('Item excluído')
  await fetchItems()
}

onMounted(() => fetchItems())
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight">Estoque / Inventario</h1>
        <p class="text-sm text-muted-foreground">Itens recebidos pela diaconia</p>
      </div>
      <RouterLink to="/inventory/new">
        <Button>
          <Plus class="mr-2 h-4 w-4" />
          Nova Entrada
        </Button>
      </RouterLink>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row">
      <Input
        v-model="search"
        placeholder="Buscar item..."
        class="sm:max-w-xs"
        @keyup.enter="handleFilter"
      />
      <Select v-model="categoryFilter" @update:model-value="handleFilter">
        <SelectTrigger class="sm:w-48">
          <SelectValue placeholder="Todas categorias" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="alimento">Alimento</SelectItem>
          <SelectItem value="roupa">Roupa</SelectItem>
          <SelectItem value="movel">Movel</SelectItem>
          <SelectItem value="financeiro">Financeiro</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" @click="handleFilter">Filtrar</Button>
    </div>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead class="text-right">Qtd</TableHead>
            <TableHead>Recebido</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Foto</TableHead>
            <TableHead v-if="auth.isAdmin" class="text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell :colspan="auth.isAdmin ? 7 : 6" class="text-center py-8 text-muted-foreground">
              Carregando...
            </TableCell>
          </TableRow>
          <TableRow v-else-if="items.length === 0">
            <TableCell :colspan="auth.isAdmin ? 7 : 6" class="text-center py-8 text-muted-foreground">
              Nenhum item encontrado
            </TableCell>
          </TableRow>
          <TableRow v-for="item in items" :key="item.id">
            <TableCell>
              <div>
                <div class="font-medium">{{ item.item_name }}</div>
                <div v-if="item.donor_name" class="text-xs text-muted-foreground">
                  Doador: {{ item.donor_name }}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getCategoryVariant(item.category)">
                {{ categoryLabels[item.category] }}
              </Badge>
            </TableCell>
            <TableCell class="text-right font-mono tabular-nums">
              {{ item.quantity }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ new Date(item.received_date).toLocaleDateString('pt-BR') }}
            </TableCell>
            <TableCell>
              <template v-if="item.expiry_date">
                <span
                  :class="{
                    'text-destructive font-medium': isExpired(item.expiry_date),
                    'text-amber-600 font-medium': isExpiringSoon(item.expiry_date),
                  }"
                >
                  {{ new Date(item.expiry_date).toLocaleDateString('pt-BR') }}
                </span>
              </template>
              <span v-else class="text-muted-foreground">—</span>
            </TableCell>
            <TableCell>
              <Button
                v-if="item.photo_url"
                variant="ghost"
                size="icon"
                @click="photoPreview = item.photo_url"
              >
                <Image class="h-4 w-4" />
              </Button>
              <span v-else class="text-muted-foreground">—</span>
            </TableCell>
            <TableCell v-if="auth.isAdmin" class="text-right">
              <Button
                variant="ghost"
                size="icon"
                @click="handleDelete(item.id)"
              >
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog :open="!!photoPreview" @update:open="photoPreview = null">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Foto do Item</DialogTitle>
        </DialogHeader>
        <img
          v-if="photoPreview"
          :src="photoPreview"
          alt="Foto do item"
          class="w-full rounded-md"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>
