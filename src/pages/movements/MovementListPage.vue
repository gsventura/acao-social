<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDonationMovements } from '@/composables/useDonationMovements'
import { Button } from '@/components/ui/button'
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
const { movements, loading, fetchMovements, deleteMovement } =
  useDonationMovements()

const photoPreview = ref<string | null>(null)

function getItemsSummary(itemsJson: unknown): string {
  const items = itemsJson as Array<{ item_name: string; quantity: number }>
  return items.map((i) => `${i.item_name} (${i.quantity})`).join(', ')
}

function getBeneficiaryName(movement: Record<string, unknown>): string {
  const ben = movement.beneficiaries as { name: string } | null
  return ben?.name || '—'
}

function getDeliveredByName(movement: Record<string, unknown>): string {
  const profile = movement.profiles as { full_name: string } | null
  return profile?.full_name || '—'
}

async function handleDelete(id: string) {
  if (!confirm('Tem certeza que deseja excluir esta movimentacao?')) return
  const { error } = await deleteMovement(id)
  if (error) {
    toast.error('Erro ao excluir movimentacao')
    return
  }
  toast.success('Movimentacao excluida')
  await fetchMovements()
}

onMounted(() => fetchMovements())
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight">Movimentações / Saídas</h1>
        <p class="text-sm text-muted-foreground">Entregas realizadas aos beneficiários</p>
      </div>
      <RouterLink to="/movements/new">
        <Button>
          <Plus class="mr-2 h-4 w-4" />
          Registrar Entrega
        </Button>
      </RouterLink>
    </div>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Beneficiário</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Data Entrega</TableHead>
            <TableHead>Entregue por</TableHead>
            <TableHead>Evidência</TableHead>
            <TableHead v-if="auth.isAdmin" class="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell :colspan="auth.isAdmin ? 6 : 5" class="text-center py-8 text-muted-foreground">
              Carregando...
            </TableCell>
          </TableRow>
          <TableRow v-else-if="movements.length === 0">
            <TableCell :colspan="auth.isAdmin ? 6 : 5" class="text-center py-8 text-muted-foreground">
              Nenhuma movimentação encontrada
            </TableCell>
          </TableRow>
          <TableRow v-for="m in movements" :key="m.id">
            <TableCell class="font-medium">
              {{ getBeneficiaryName(m as unknown as Record<string, unknown>) }}
            </TableCell>
            <TableCell class="max-w-xs truncate text-muted-foreground">
              {{ getItemsSummary(m.items_json) }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ new Date(m.delivered_at).toLocaleDateString('pt-BR') }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ getDeliveredByName(m as unknown as Record<string, unknown>) }}
            </TableCell>
            <TableCell>
              <Button
                v-if="m.evidence_photo_url"
                variant="ghost"
                size="icon"
                @click="photoPreview = m.evidence_photo_url"
              >
                <Image class="h-4 w-4" />
              </Button>
              <span v-else class="text-muted-foreground">—</span>
            </TableCell>
            <TableCell v-if="auth.isAdmin" class="text-right">
              <Button
                variant="ghost"
                size="icon"
                @click="handleDelete(m.id)"
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
          <DialogTitle>Foto da Entrega</DialogTitle>
        </DialogHeader>
        <img
          v-if="photoPreview"
          :src="photoPreview"
          alt="Evidencia da entrega"
          class="w-full rounded-md"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>
