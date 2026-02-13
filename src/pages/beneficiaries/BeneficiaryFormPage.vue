<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBeneficiaries } from '@/composables/useBeneficiaries'
import { formatDocument } from '@/lib/masks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const { getBeneficiary, createBeneficiary, updateBeneficiary } =
  useBeneficiaries()

const editId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!editId.value)

const form = ref({
  name: '',
  type: '' as string,
  document: '',
  address: '',
  contact_info: '',
  responsible_person: '',
  active: true,
})

const saving = ref(false)

watch(
  () => form.value.document,
  (val) => {
    if (form.value.type && val) {
      form.value.document = formatDocument(
        val,
        form.value.type as 'family' | 'org',
      )
    }
  },
)

onMounted(async () => {
  if (editId.value) {
    const b = await getBeneficiary(editId.value)
    if (b) {
      form.value = {
        name: b.name,
        type: b.type,
        document: b.document || '',
        address: b.address || '',
        contact_info: b.contact_info || '',
        responsible_person: b.responsible_person || '',
        active: b.active,
      }
    }
  }
})

async function handleSubmit() {
  if (!form.value.name || !form.value.type) {
    toast.error('Preencha os campos obrigatorios')
    return
  }

  saving.value = true

  const payload = {
    name: form.value.name,
    type: form.value.type,
    document: form.value.document || null,
    address: form.value.address || null,
    contact_info: form.value.contact_info || null,
    responsible_person: form.value.responsible_person || null,
    active: form.value.active,
  }

  if (isEdit.value) {
    const { error } = await updateBeneficiary(editId.value!, payload)
    saving.value = false
    if (error) {
      toast.error('Erro ao atualizar beneficiario')
      return
    }
    toast.success('Beneficiario atualizado')
  } else {
    const { error } = await createBeneficiary(payload)
    saving.value = false
    if (error) {
      toast.error('Erro ao cadastrar beneficiario')
      return
    }
    toast.success('Beneficiario cadastrado')
  }

  router.push('/beneficiaries')
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <Card>
      <CardHeader>
        <CardTitle>
          {{ isEdit ? 'Editar Beneficiario' : 'Novo Beneficiario' }}
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Nome *</Label>
          <Input
            id="name"
            v-model="form.name"
            placeholder="Nome do beneficiario"
          />
        </div>

        <div class="space-y-2">
          <Label>Tipo *</Label>
          <Select v-model="form.type">
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="family">Familia</SelectItem>
              <SelectItem value="org">Instituicao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="document">
            {{ form.type === 'org' ? 'CNPJ' : 'CPF' }}
          </Label>
          <Input
            id="document"
            v-model="form.document"
            :placeholder="form.type === 'org' ? '00.000.000/0000-00' : '000.000.000-00'"
          />
        </div>

        <div class="space-y-2">
          <Label for="address">Endereco</Label>
          <Textarea
            id="address"
            v-model="form.address"
            placeholder="Endereco completo"
            rows="2"
          />
        </div>

        <div class="space-y-2">
          <Label for="contact">Contato (telefone/e-mail)</Label>
          <Input
            id="contact"
            v-model="form.contact_info"
            placeholder="Telefone ou e-mail"
          />
        </div>

        <div class="space-y-2">
          <Label for="responsible">Responsavel</Label>
          <Input
            id="responsible"
            v-model="form.responsible_person"
            placeholder="Nome do responsavel"
          />
        </div>

        <div class="flex items-center gap-3">
          <Switch
            :checked="form.active"
            @update:checked="form.active = $event"
          />
          <Label>{{ form.active ? 'Ativo' : 'Inativo' }}</Label>
        </div>

        <div class="flex gap-3 pt-4">
          <Button @click="handleSubmit" :disabled="saving">
            {{ saving ? 'Salvando...' : isEdit ? 'Atualizar' : 'Cadastrar' }}
          </Button>
          <Button variant="outline" @click="router.push('/beneficiaries')">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
