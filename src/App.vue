<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Toaster } from '@/components/ui/sonner'

const auth = useAuthStore()
onMounted(() => auth.initialize())
</script>

<template>
  <Toaster />
  <RouterView />
</template>
