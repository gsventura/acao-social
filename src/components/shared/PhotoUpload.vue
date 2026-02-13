<script setup lang="ts">
import { ref } from 'vue'
import { useFileUpload } from '@/composables/useFileUpload'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  modelValue: string | null
  folder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const { uploadFile, uploading } = useFileUpload()
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

function openFileDialog() {
  fileInput.value?.click()
}

async function handleFile(file: File) {
  if (!file.type.startsWith('image/')) {
    toast.error('Apenas imagens sao aceitas')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error('Tamanho maximo: 5MB')
    return
  }

  const url = await uploadFile(file, props.folder || 'evidence')
  if (url) {
    emit('update:modelValue', url)
  }
}

async function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) await handleFile(file)
  target.value = ''
}

async function onDrop(event: DragEvent) {
  dragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) await handleFile(file)
}

function removePhoto() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileChange"
    />

    <div v-if="modelValue" class="relative">
      <img
        :src="modelValue"
        alt="Foto"
        class="h-40 w-full rounded-lg border object-cover"
      />
      <Button
        variant="destructive"
        size="icon"
        class="absolute right-2 top-2 h-7 w-7"
        @click="removePhoto"
      >
        <X class="h-4 w-4" />
      </Button>
    </div>

    <div
      v-else
      class="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
      :class="dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'"
      @click="openFileDialog"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
    >
      <Loader2 v-if="uploading" class="h-8 w-8 animate-spin text-muted-foreground" />
      <template v-else>
        <Upload class="h-8 w-8 text-muted-foreground" />
        <p class="mt-2 text-sm text-muted-foreground">
          Clique ou arraste uma foto
        </p>
      </template>
    </div>
  </div>
</template>
