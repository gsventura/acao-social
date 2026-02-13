import { supabase } from '@/lib/supabase'

export function useDashboard() {
  async function getMonthlyMetrics() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0]
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0]

    const [movementsRes, inventoryRes, expiringRes] = await Promise.all([
      supabase
        .from('donation_movements')
        .select('id, beneficiary_id')
        .gte('delivered_at', startOfMonth)
        .lte('delivered_at', endOfMonth),
      supabase
        .from('inventory_items')
        .select('id')
        .gte('created_at', `${startOfMonth}T00:00:00`)
        .lte('created_at', `${endOfMonth}T23:59:59`),
      supabase
        .from('inventory_items')
        .select('id')
        .gt('quantity', 0)
        .not('expiry_date', 'is', null)
        .lte(
          'expiry_date',
          new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        ),
    ])

    const movements = movementsRes.data || []
    const uniqueBeneficiaries = new Set(
      movements.map((m) => m.beneficiary_id),
    )

    return {
      basketsDelivered: movements.length,
      itemsExpiringSoon: (expiringRes.data || []).length,
      familiesServed: uniqueBeneficiaries.size,
      totalEntriesThisMonth: (inventoryRes.data || []).length,
    }
  }

  async function getRecentEntries(limit = 5) {
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    return data || []
  }

  async function getRecentExits(limit = 5) {
    const { data } = await supabase
      .from('donation_movements')
      .select(
        '*, beneficiaries(name), profiles!donation_movements_delivered_by_fkey(full_name)',
      )
      .order('created_at', { ascending: false })
      .limit(limit)
    return data || []
  }

  return {
    getMonthlyMetrics,
    getRecentEntries,
    getRecentExits,
  }
}
