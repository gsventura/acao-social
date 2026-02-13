<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import type { WebhookConfig } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { isValidUrl } from '@/lib/validators'

const auth = useAuthStore()

const configs = ref<WebhookConfig[]>([])
const loading = ref(false)
const dialogOpen = ref(false)

const newConfig = ref({
  event_type: '' as string,
  url: '',
  active: true,
})

async function fetchConfigs() {
  loading.value = true
  const { data } = await supabase
    .from('webhook_configs')
    .select('*')
    .order('created_at', { ascending: false })
  configs.value = (data as WebhookConfig[]) || []
  loading.value = false
}

async function addConfig() {
  if (!newConfig.value.event_type || !newConfig.value.url) {
    toast.error('Preencha todos os campos')
    return
  }

  if (!isValidUrl(newConfig.value.url)) {
    toast.error('URL invalida')
    return
  }

  const { error } = await supabase.from('webhook_configs').insert({
    event_type: newConfig.value.event_type,
    url: newConfig.value.url,
    active: newConfig.value.active,
    created_by: auth.user!.id,
  })

  if (error) {
    toast.error('Erro ao criar webhook')
    return
  }

  toast.success('Webhook criado')
  dialogOpen.value = false
  newConfig.value = { event_type: '', url: '', active: true }
  await fetchConfigs()
}

async function toggleActive(id: string, active: boolean) {
  const { error } = await supabase
    .from('webhook_configs')
    .update({ active })
    .eq('id', id)

  if (error) {
    toast.error('Erro ao atualizar status do webhook')
    return
  }

  toast.success(active ? 'Webhook ativado' : 'Webhook desativado')
  await fetchConfigs()
}

async function deleteConfig(id: string) {
  if (!confirm('Excluir este webhook?')) return
  const { error } = await supabase
    .from('webhook_configs')
    .delete()
    .eq('id', id)
  if (error) {
    toast.error('Erro ao excluir')
    return
  }
  toast.success('Webhook excluido')
  await fetchConfigs()
}

const eventLabels: Record<string, string> = {
  donation_received: 'Doacao Recebida',
  donation_delivered: 'Entrega Realizada',
}

onMounted(() => fetchConfigs())
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Webhooks</h1>
      <Button @click="dialogOpen = true">
        <Plus class="mr-2 h-4 w-4" />
        Novo Webhook
      </Button>
    </div>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Evento</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead class="text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="4" class="text-center py-8 text-muted-foreground">
              Carregando...
            </TableCell>
          </TableRow>
          <TableRow v-else-if="configs.length === 0">
            <TableCell colspan="4" class="text-center py-8 text-muted-foreground">
              Nenhum webhook configurado
            </TableCell>
          </TableRow>
          <TableRow v-for="c in configs" :key="c.id">
            <TableCell>
              <Badge variant="secondary">
                {{ eventLabels[c.event_type] || c.event_type }}
              </Badge>
            </TableCell>
            <TableCell class="max-w-xs truncate font-mono text-sm">
              {{ c.url }}
            </TableCell>
            <TableCell>
              <Switch
                :checked="c.active"
                @update:checked="toggleActive(c.id, $event)"
              />
            </TableCell>
            <TableCell class="text-right">
              <Button
                variant="ghost"
                size="icon"
                @click="deleteConfig(c.id)"
              >
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Webhook</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Evento</Label>
            <Select v-model="newConfig.event_type">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="donation_received">Doacao Recebida</SelectItem>
                <SelectItem value="donation_delivered">Entrega Realizada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>URL</Label>
            <Input
              v-model="newConfig.url"
              placeholder="https://example.com/webhook"
            />
          </div>
          <div class="flex items-center gap-3">
            <Switch
              :checked="newConfig.active"
              @update:checked="newConfig.active = $event"
            />
            <Label>Ativo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="dialogOpen = false">
            Cancelar
          </Button>
          <Button @click="addConfig">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
