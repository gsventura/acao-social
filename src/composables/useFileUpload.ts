import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useFileUpload() {
  const uploading = ref(false)
  const error = ref<string | null>(null)

  async function uploadFile(
    file: File,
    folder: string = 'evidence',
  ): Promise<string | null> {
    uploading.value = true
    error.value = null

    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('donations-evidence')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    uploading.value = false

    if (uploadError) {
      error.value = uploadError.message
      return null
    }

    const { data } = supabase.storage
      .from('donations-evidence')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  return { uploadFile, uploading, error }
}
