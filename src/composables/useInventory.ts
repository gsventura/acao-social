import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { InventoryItem } from '@/types/database.types'

export function useInventory() {
  const items = ref<InventoryItem[]>([])
  const loading = ref(false)

  async function fetchItems(filters?: {
    category?: string
    search?: string
  }) {
    loading.value = true
    let query = supabase
      .from('inventory_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.search) {
      query = query.ilike('item_name', `%${filters.search}%`)
    }

    const { data } = await query
    items.value = (data as InventoryItem[]) || []
    loading.value = false
  }

  async function getItem(id: string) {
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single()
    return data as InventoryItem | null
  }

  async function createItem(item: {
    item_name: string
    category: string
    quantity: number
    donor_name?: string | null
    received_date: string
    expiry_date?: string | null
    photo_url?: string | null
    created_by: string
  }) {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(item)
      .select()
      .single()
    return { data: data as InventoryItem | null, error }
  }

  async function updateItem(
    id: string,
    updates: Record<string, unknown>,
  ) {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data: data as InventoryItem | null, error }
  }

  async function deleteItem(id: string) {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)
    return { error }
  }

  async function getAvailableStock() {
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .gt('quantity', 0)
      .order('item_name')
    return (data as InventoryItem[]) || []
  }

  return {
    items,
    loading,
    fetchItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    getAvailableStock,
  }
}
