import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Beneficiary } from '@/types/database.types'

export function useBeneficiaries() {
  const beneficiaries = ref<Beneficiary[]>([])
  const loading = ref(false)

  async function fetchBeneficiaries(filters?: {
    type?: string
    search?: string
    active?: boolean | null
  }) {
    loading.value = true
    let query = supabase
      .from('beneficiaries')
      .select('*')
      .order('name')

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    if (filters?.active !== null && filters?.active !== undefined) {
      query = query.eq('active', filters.active)
    }

    const { data } = await query
    beneficiaries.value = (data as Beneficiary[]) || []
    loading.value = false
  }

  async function getBeneficiary(id: string) {
    const { data } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('id', id)
      .single()
    return data as Beneficiary | null
  }

  async function createBeneficiary(beneficiary: {
    name: string
    type: string
    document?: string | null
    address?: string | null
    contact_info?: string | null
    responsible_person?: string | null
    active?: boolean
  }) {
    const { data, error } = await supabase
      .from('beneficiaries')
      .insert(beneficiary)
      .select()
      .single()
    return { data: data as Beneficiary | null, error }
  }

  async function updateBeneficiary(
    id: string,
    updates: Record<string, unknown>,
  ) {
    const { data, error } = await supabase
      .from('beneficiaries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data: data as Beneficiary | null, error }
  }

  async function deleteBeneficiary(id: string) {
    const { error } = await supabase
      .from('beneficiaries')
      .delete()
      .eq('id', id)
    return { error }
  }

  async function getActiveBeneficiaries() {
    const { data } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('active', true)
      .order('name')
    return (data as Beneficiary[]) || []
  }

  return {
    beneficiaries,
    loading,
    fetchBeneficiaries,
    getBeneficiary,
    createBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    getActiveBeneficiaries,
  }
}
