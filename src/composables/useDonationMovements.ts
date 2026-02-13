import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { DonationMovement } from '@/types/database.types'

export function useDonationMovements() {
  const movements = ref<DonationMovement[]>([])
  const loading = ref(false)

  async function fetchMovements(filters?: {
    beneficiary_id?: string
  }) {
    loading.value = true
    let query = supabase
      .from('donation_movements')
      .select('*, beneficiaries(name), profiles!donation_movements_delivered_by_fkey(full_name)')
      .order('created_at', { ascending: false })

    if (filters?.beneficiary_id) {
      query = query.eq('beneficiary_id', filters.beneficiary_id)
    }

    const { data } = await query
    movements.value = (data as unknown as DonationMovement[]) || []
    loading.value = false
  }

  async function createMovement(movement: {
    beneficiary_id: string
    items_json: Array<{
      inventory_item_id: string
      item_name: string
      quantity: number
    }>
    delivered_at: string
    evidence_photo_url?: string | null
    delivered_by: string
  }) {
    const { data, error } = await supabase
      .from('donation_movements')
      .insert(movement)
      .select()
      .single()
    return { data: data as DonationMovement | null, error }
  }

  async function deleteMovement(id: string) {
    const { error } = await supabase
      .from('donation_movements')
      .delete()
      .eq('id', id)
    return { error }
  }

  return {
    movements,
    loading,
    fetchMovements,
    createMovement,
    deleteMovement,
  }
}
