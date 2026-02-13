<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDonationMovements } from '@/composables/useDonationMovements'
import { useBeneficiaries } from '@/composables/useBeneficiaries'
import { useInventory } from '@/composables/useInventory'
import { dispatchWebhook } from '@/lib/webhook'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PhotoUpload from '@/components/shared/PhotoUpload.vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Beneficiary, InventoryItem } from '@/types/database.types'

const router = useRouter()
const auth = useAuthStore()
const { createMovement } = useDonationMovements()
const { getActiveBeneficiaries } = useBeneficiaries()
const { getAvailableStock } = useInventory()

const activeBeneficiaries = ref<Beneficiary[]>([])
const availableStock = ref<InventoryItem[]>([])

interface MovementItemRow {
  inventory_item_id: string
  quantity: number
}

const form = ref({
  beneficiary_id: '',
  items: [{ inventory_item_id: '', quantity: 1 }] as MovementItemRow[],
  delivered_at: new Date().toISOString().split('T')[0]!,
  evidence_photo_url: null as string | null,
})

const saving = ref(false)

function addItem() {
  form.value.items.push({ inventory_item_id: '', quantity: 1 })
}

function removeItem(index: number) {
  form.value.items.splice(index, 1)
}

const categoryLabels: Record<string, string> = {
  alimento: 'Alimento',
  roupa: 'Roupa',
  movel: 'Movel',
  financeiro: 'Financeiro',
}

function formatDate(date: string): string {
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}

function getMaxQty(itemId: string): number {
  const item = availableStock.value.find((i) => i.id === itemId)
  return item ? item.quantity : 0
}

function getItemName(itemId: string): string {
  const item = availableStock.value.find((i) => i.id === itemId)
  return item?.item_name || ''
}

async function handleSubmit() {
  if (!form.value.beneficiary_id) {
    toast.error('Selecione um beneficiario')
    return
  }

  const validItems = form.value.items.filter(
    (i) => i.inventory_item_id && i.quantity > 0,
  )
  if (validItems.length === 0) {
    toast.error('Adicione pelo menos um item')
    return
  }

  for (const item of validItems) {
    const maxQty = getMaxQty(item.inventory_item_id)
    if (item.quantity > maxQty) {
      toast.error(
        `Quantidade de "${getItemName(item.inventory_item_id)}" excede o estoque (${maxQty})`,
      )
      return
    }
  }

  saving.value = true

  try {
    const itemsJson = validItems.map((i) => ({
      inventory_item_id: i.inventory_item_id,
      item_name: getItemName(i.inventory_item_id),
      quantity: i.quantity,
    }))

    const beneficiary = activeBeneficiaries.value.find(
      (b) => b.id === form.value.beneficiary_id,
    )

    const { data, error } = await createMovement({
      beneficiary_id: form.value.beneficiary_id,
      items_json: itemsJson,
      delivered_at: form.value.delivered_at,
      evidence_photo_url: form.value.evidence_photo_url,
      delivered_by: auth.user!.id,
    })

    if (error) {
      toast.error(`Erro ao registrar entrega: ${error.message}`)
      return
    }

    toast.success('Entrega registrada')

    if (data) {
      dispatchWebhook('doacao_entregue', {
        beneficiary: beneficiary?.name || '',
        delivered_by: auth.profile?.full_name || '',
        items: itemsJson,
        evidence_url: data.evidence_photo_url,
      })
    }

    router.push('/movements')
  } catch (err) {
    toast.error('Erro inesperado ao salvar. Verifique sua conexao.')
    console.error('handleSubmit error:', err)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  activeBeneficiaries.value = await getActiveBeneficiaries()
  availableStock.value = await getAvailableStock()
})
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <Card>
      <CardHeader>
        <CardTitle>Registrar Entrega de Doacao</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label>Beneficiario *</Label>
          <Select v-model="form.beneficiary_id">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o beneficiario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="b in activeBeneficiaries"
                :key="b.id"
                :value="b.id"
              >
                {{ b.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <Label>Itens *</Label>
            <Button variant="outline" size="sm" @click="addItem">
              <Plus class="mr-1 h-4 w-4" />
              Adicionar Item
            </Button>
          </div>

          <div
            v-for="(item, index) in form.items"
            :key="index"
            class="flex items-end gap-3"
          >
            <div class="flex-1 space-y-1">
              <Label v-if="index === 0" class="text-xs">Item</Label>
              <Select v-model="item.inventory_item_id">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent class="max-h-72">
                  <SelectItem
                    v-for="s in availableStock"
                    :key="s.id"
                    :value="s.id"
                  >
                    <div class="flex flex-col py-0.5">
                      <span>{{ s.item_name }} <span class="text-muted-foreground">({{ categoryLabels[s.category] }}, {{ s.quantity }} un.)</span></span>
                      <span class="text-xs text-muted-foreground">
                        {{ s.donor_name || 'Doador anonimo' }} · {{ formatDate(s.received_date) }}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="w-24 space-y-1">
              <Label v-if="index === 0" class="text-xs">Qtd</Label>
              <Input
                v-model.number="item.quantity"
                type="number"
                min="1"
                :max="getMaxQty(item.inventory_item_id)"
              />
            </div>

            <Button
              v-if="form.items.length > 1"
              variant="ghost"
              size="icon"
              @click="removeItem(index)"
            >
              <Trash2 class="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="delivered_at">Data da Entrega *</Label>
          <Input
            id="delivered_at"
            v-model="form.delivered_at"
            type="date"
          />
        </div>

        <div class="space-y-2">
          <Label>Entregue por</Label>
          <Input
            :model-value="auth.profile?.full_name || ''"
            disabled
          />
        </div>

        <div class="space-y-2">
          <Label>Foto da Entrega (evidencia)</Label>
          <PhotoUpload
            v-model="form.evidence_photo_url"
            folder="deliveries"
          />
        </div>

        <div class="flex gap-3 pt-4">
          <Button @click="handleSubmit" :disabled="saving">
            {{ saving ? 'Salvando...' : 'Registrar Entrega' }}
          </Button>
          <Button variant="outline" @click="router.push('/movements')">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
