export type Role = 'admin' | 'member'
export type BeneficiaryType = 'familia' | 'organizacao'
export type ItemCategory = 'alimento' | 'roupa' | 'movel' | 'financeiro'

export interface Profile {
  id: string
  full_name: string
  role: Role
  avatar_url: string | null
  created_at: string
}

export interface Beneficiary {
  id: string
  name: string
  type: BeneficiaryType
  document: string | null
  address: string | null
  contact_info: string | null
  responsible_person: string | null
  active: boolean
  created_at: string
}

export interface InventoryItem {
  id: string
  created_at: string
  item_name: string
  category: ItemCategory
  quantity: number
  donor_name: string | null
  received_date: string
  expiry_date: string | null
  photo_url: string | null
  created_by: string
}

export interface DonationMovementItem {
  inventory_item_id: string
  item_name: string
  quantity: number
}

export interface DonationMovement {
  id: string
  beneficiary_id: string
  items_json: DonationMovementItem[]
  delivered_at: string
  evidence_photo_url: string | null
  delivered_by: string
  created_at: string
}

export interface WebhookConfig {
  id: string
  event_type: 'doacao_recebida' | 'doacao_entregue'
  url: string
  active: boolean
  created_at: string
  created_by: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      beneficiaries: {
        Row: Beneficiary
        Insert: Omit<Beneficiary, 'id' | 'created_at'>
        Update: Partial<Omit<Beneficiary, 'id'>>
      }
      inventory_items: {
        Row: InventoryItem
        Insert: Omit<InventoryItem, 'id' | 'created_at'>
        Update: Partial<Omit<InventoryItem, 'id' | 'created_at'>>
      }
      donation_movements: {
        Row: DonationMovement
        Insert: Omit<DonationMovement, 'id' | 'created_at'>
        Update: Partial<Omit<DonationMovement, 'id' | 'created_at'>>
      }
      webhook_configs: {
        Row: WebhookConfig
        Insert: Omit<WebhookConfig, 'id' | 'created_at'>
        Update: Partial<Omit<WebhookConfig, 'id' | 'created_at'>>
      }
    }
    Enums: {
      role: Role
      beneficiary_type: BeneficiaryType
      item_category: ItemCategory
    }
  }
}
