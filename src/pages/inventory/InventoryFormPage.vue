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
    toast.error('Preencha os campos obrigatorios')
    return
  }

  if (form.value.category === 'food' && !form.value.expiry_date) {
    toast.error('Data de validade e obrigatoria para alimentos')
    return
  }

  saving.value = true

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
    saving.value = false
    if (error) {
      toast.error('Erro ao atualizar item')
      return
    }
    toast.success('Item atualizado')
  } else {
    const { data, error } = await createItem(payload)
    saving.value = false
    if (error) {
      toast.error('Erro ao registrar doacao')
      return
    }
    toast.success('Doacao registrada')

    if (data) {
      await dispatchWebhook('donation_received', {
        item: data.item_name,
        category: data.category,
        quantity: data.quantity,
        donor: data.donor_name || 'Anonimo',
        received_date: data.received_date,
      })
    }
  }

  router.push('/inventory')
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <Card>
      <CardHeader>
        <CardTitle>
          {{ isEdit ? 'Editar Item' : 'Registrar Doacao Recebida' }}
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="donor">Doador</Label>
          <Input
            id="donor"
            v-model="form.donor_name"
            placeholder="Anonimo se vazio"
          />
        </div>

        <div class="space-y-2">
          <Label for="item_name">Nome do Item *</Label>
          <Input
            id="item_name"
            v-model="form.item_name"
            placeholder="Ex: Cesta Basica"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label>Categoria *</Label>
            <Select v-model="form.category">
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Alimento</SelectItem>
                <SelectItem value="clothing">Roupa</SelectItem>
                <SelectItem value="furniture">Movel</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
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
          <div class="space-y-2">
            <Label for="received_date">Data de Recebimento *</Label>
            <Input
              id="received_date"
              v-model="form.received_date"
              type="date"
            />
          </div>

          <div class="space-y-2">
            <Label for="expiry_date">
              Data de Validade
              <span v-if="form.category === 'food'" class="text-destructive">*</span>
            </Label>
            <Input
              id="expiry_date"
              v-model="form.expiry_date"
              type="date"
            />
          </div>
        </div>

        <div class="space-y-2">
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
