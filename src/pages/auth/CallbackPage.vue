<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const error = ref<string | null>(null)

onMounted(async () => {
  const { error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    error.value = sessionError.message
    setTimeout(() => router.push('/auth/login'), 3000)
    return
  }

  router.push('/dashboard')
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background">
    <div class="text-center">
      <template v-if="error">
        <p class="text-destructive">{{ error }}</p>
        <p class="mt-2 text-sm text-muted-foreground">Redirecionando para login...</p>
      </template>
      <template v-else>
        <div class="flex items-center gap-2">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span class="text-muted-foreground">Autenticando...</span>
        </div>
      </template>
    </div>
  </div>
</template>
