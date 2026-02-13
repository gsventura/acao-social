<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDashboard } from '@/composables/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Package, AlertTriangle, Users, TrendingUp } from 'lucide-vue-next'

const { getMonthlyMetrics, getRecentEntries, getRecentExits } = useDashboard()

const metrics = ref({
  basketsDelivered: 0,
  itemsExpiringSoon: 0,
  familiesServed: 0,
  totalEntriesThisMonth: 0,
})

const recentEntries = ref<Record<string, unknown>[]>([])
const recentExits = ref<Record<string, unknown>[]>([])
const loading = ref(true)

const categoryLabels: Record<string, string> = {
  alimento: 'Alimento',
  roupa: 'Roupa',
  movel: 'Movel',
  financeiro: 'Financeiro',
}

onMounted(async () => {
  loading.value = true
  const [m, entries, exits] = await Promise.all([
    getMonthlyMetrics(),
    getRecentEntries(),
    getRecentExits(),
  ])
  metrics.value = m
  recentEntries.value = entries
  recentExits.value = exits
  loading.value = false
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Dashboard</h1>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Entregas no Mes</CardTitle>
          <Package class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ loading ? '...' : metrics.basketsDelivered }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Itens a Vencer</CardTitle>
          <AlertTriangle class="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ loading ? '...' : metrics.itemsExpiringSoon }}
          </div>
          <p class="text-xs text-muted-foreground">Proximos 7 dias</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Familias Atendidas</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ loading ? '...' : metrics.familiesServed }}
          </div>
          <p class="text-xs text-muted-foreground">Neste mes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Entradas no Mes</CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ loading ? '...' : metrics.totalEntriesThisMonth }}
          </div>
        </CardContent>
      </Card>
    </div>

    <Tabs default-value="entries">
      <TabsList>
        <TabsTrigger value="entries">Entradas Recentes</TabsTrigger>
        <TabsTrigger value="exits">Saidas Recentes</TabsTrigger>
      </TabsList>

      <TabsContent value="entries">
        <Card>
          <CardContent class="pt-6">
            <div class="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead class="text-right">Qtd</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="recentEntries.length === 0">
                    <TableCell colspan="4" class="text-center py-4 text-muted-foreground">
                      Nenhuma entrada recente
                    </TableCell>
                  </TableRow>
                  <TableRow v-for="item in recentEntries" :key="(item as Record<string, unknown>).id as string">
                    <TableCell class="font-medium">
                      {{ (item as Record<string, unknown>).item_name }}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {{ categoryLabels[(item as Record<string, unknown>).category as string] }}
                      </Badge>
                    </TableCell>
                    <TableCell class="text-right font-mono">
                      {{ (item as Record<string, unknown>).quantity }}
                    </TableCell>
                    <TableCell>
                      {{ new Date((item as Record<string, unknown>).received_date as string).toLocaleDateString('pt-BR') }}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div class="mt-3 text-right">
              <RouterLink to="/inventory" class="text-sm text-primary hover:underline">
                Ver todo o estoque
              </RouterLink>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="exits">
        <Card>
          <CardContent class="pt-6">
            <div class="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beneficiario</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="recentExits.length === 0">
                    <TableCell colspan="3" class="text-center py-4 text-muted-foreground">
                      Nenhuma saida recente
                    </TableCell>
                  </TableRow>
                  <TableRow v-for="m in recentExits" :key="(m as Record<string, unknown>).id as string">
                    <TableCell class="font-medium">
                      {{ ((m as Record<string, unknown>).beneficiaries as { name: string } | null)?.name || '---' }}
                    </TableCell>
                    <TableCell class="max-w-xs truncate">
                      {{
                        ((m as Record<string, unknown>).items_json as Array<{ item_name: string; quantity: number }>)
                          .map((i) => `${i.item_name} (${i.quantity})`)
                          .join(', ')
                      }}
                    </TableCell>
                    <TableCell>
                      {{ new Date((m as Record<string, unknown>).delivered_at as string).toLocaleDateString('pt-BR') }}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div class="mt-3 text-right">
              <RouterLink to="/movements" class="text-sm text-primary hover:underline">
                Ver todas as movimentacoes
              </RouterLink>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
