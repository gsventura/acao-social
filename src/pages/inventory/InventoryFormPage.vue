<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
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
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { getItem, createItem, updateItem } = useInventory()

const editId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!editId.value)

const form = ref({
  item_name: '',
  category: '' as string,
  quantity: 1,
  donor_name: '',
  received_date: new Date().toISOString().split('T')[0]!,
  expiry_date: '',
  photo_url: null as string | null,
})

const saving = ref(false)

onMounted(async () => {
  if (editId.value) {
    const item = await getItem(editId.value)
    if (item) {
      form.value = {
        item_name: item.item_name,
        category: item.category,
        quantity: item.quantity,
        donor_name: item.donor_name || '',
        received_date: item.received_date,
        expiry_date: item.expiry_date || '',
        photo_url: item.photo_url,
      }
    }
  }
})

async function handleSubmit() {
  if (!form.value.item_name || !form.value.category || !form.value.quantity) {
    toast.error('Preencha os campos obrigatórios')
    return
  }

  if (form.value.category === 'alimento' && !form.value.expiry_date) {
    toast.error('Data de validade é obrigatória para alimentos')
    return
  }

  saving.value = true

  try {
    const payload = {
      item_name: form.value.item_name,
      category: form.value.category,
      quantity: form.value.quantity,
      donor_name: form.value.donor_name || null,
      received_date: form.value.received_date,
      expiry_date: form.value.expiry_date || null,
      photo_url: form.value.photo_url,
      created_by: auth.user!.id,
    }

    if (isEdit.value) {
      const { error } = await updateItem(editId.value!, payload)
      if (error) {
        toast.error(`Erro ao atualizar item: ${error.message}`)
        return
      }
      toast.success('Item atualizado')
    } else {
      const { data, error } = await createItem(payload)
      if (error) {
        toast.error(`Erro ao registrar doação: ${error.message}`)
        return
      }
      toast.success('Doação registrada')

      if (data) {
        dispatchWebhook('doacao_recebida', {
          item: data.item_name,
          category: data.category,
          quantity: data.quantity,
          donor: data.donor_name || 'Anônimo',
          received_date: data.received_date,
        })
      }
    }

    router.push('/inventory')
  } catch (err) {
    toast.error('Erro inesperado ao salvar. Verifique sua conexao.')
    console.error('handleSubmit error:', err)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <Card class="border-t-2 border-t-[var(--stewardship)]">
      <CardHeader>
        <CardTitle class="text-lg">
          {{ isEdit ? 'Editar Item' : 'Registrar Doação Recebida' }}
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-1.5">
          <Label for="donor">Doador</Label>
          <Input
            id="donor"
            v-model="form.donor_name"
            placeholder="Anônimo se vazio"
          />
        </div>

        <div class="space-y-1.5">
          <Label for="item_name">Nome do Item *</Label>
          <Input
            id="item_name"
            v-model="form.item_name"
            placeholder="Ex: Cesta Basica"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <Label>Categoria *</Label>
            <Select v-model="form.category">
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alimento">Alimento</SelectItem>
                <SelectItem value="roupa">Roupa</SelectItem>
                <SelectItem value="movel">Móvel</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-1.5">
            <Label for="quantity">Quantidade *</Label>
            <Input
              id="quantity"
              v-model.number="form.quantity"
              type="number"
              min="1"
            />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <Label for="received_date">Data de Recebimento *</Label>
            <Input
              id="received_date"
              v-model="form.received_date"
              type="date"
            />
          </div>

          <div class="space-y-1.5">
            <Label for="expiry_date">
              Data de Validade
              <span v-if="form.category === 'alimento'" class="text-destructive">*</span>
            </Label>
            <Input
              id="expiry_date"
              v-model="form.expiry_date"
              type="date"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label>Foto do Item</Label>
          <PhotoUpload
            v-model="form.photo_url"
            folder="inventory"
          />
        </div>

        <div class="flex gap-3 pt-4">
          <Button @click="handleSubmit" :disabled="saving">
            {{ saving ? 'Salvando...' : isEdit ? 'Atualizar' : 'Registrar' }}
          </Button>
          <Button variant="outline" @click="router.push('/inventory')">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
