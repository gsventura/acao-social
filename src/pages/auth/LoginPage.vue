<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'vue-sonner'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const fullName = ref('')
const loading = ref(false)
const magicLinkSent = ref(false)
const isSignUp = ref(false)

async function handlePasswordLogin() {
  if (!email.value || !password.value) {
    toast.error('Preencha todos os campos')
    return
  }

  loading.value = true
  const { error } = await auth.signInWithPassword(email.value, password.value)
  loading.value = false

  if (error) {
    toast.error(error.message)
    return
  }

  router.push('/dashboard')
}

async function handleSignUp() {
  if (!email.value || !password.value || !fullName.value) {
    toast.error('Preencha todos os campos')
    return
  }

  loading.value = true
  const { error } = await auth.signUp(email.value, password.value, fullName.value)
  loading.value = false

  if (error) {
    toast.error(error.message)
    return
  }

  toast.success('Conta criada! Verifique seu e-mail para confirmar.')
  isSignUp.value = false
}

async function handleMagicLink() {
  if (!email.value) {
    toast.error('Informe seu e-mail')
    return
  }

  loading.value = true
  const { error } = await auth.signInWithMagicLink(email.value)
  loading.value = false

  if (error) {
    toast.error(error.message)
    return
  }

  magicLinkSent.value = true
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4">
    <div class="w-full max-w-sm">
      <!-- Logo and identity -->
      <div class="mb-8 flex flex-col items-center gap-3">
        <img src="/logotop.png" alt="IPM Logo" class="h-16 w-16" />
        <div class="text-center">
          <h1 class="text-lg font-semibold tracking-tight text-foreground">Diaconia App</h1>
          <p class="text-sm text-muted-foreground">Gestao Diaconal — IPM Campinas</p>
        </div>
      </div>

      <Card class="border-t-2 border-t-[var(--stewardship)]">
        <CardContent class="pt-6">
          <Tabs default-value="password">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="password">E-mail / Senha</TabsTrigger>
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
            </TabsList>

            <TabsContent value="password" class="space-y-4 pt-4">
              <template v-if="isSignUp">
                <div class="space-y-1.5">
                  <Label for="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    v-model="fullName"
                    placeholder="Seu nome completo"
                  />
                </div>
              </template>

              <div class="space-y-1.5">
                <Label for="email">E-mail</Label>
                <Input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="seu@email.com"
                />
              </div>

              <div class="space-y-1.5">
                <Label for="password">Senha</Label>
                <Input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="Sua senha"
                  @keyup.enter="isSignUp ? handleSignUp() : handlePasswordLogin()"
                />
              </div>

              <Button
                class="w-full"
                :disabled="loading"
                @click="isSignUp ? handleSignUp() : handlePasswordLogin()"
              >
                {{ loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar' }}
              </Button>

              <p class="text-center text-sm text-muted-foreground">
                <button
                  class="underline hover:text-foreground transition-colors"
                  @click="isSignUp = !isSignUp"
                >
                  {{ isSignUp ? 'Ja tem conta? Entrar' : 'Nao tem conta? Cadastre-se' }}
                </button>
              </p>
            </TabsContent>

            <TabsContent value="magic" class="space-y-4 pt-4">
              <template v-if="magicLinkSent">
                <div class="rounded-md border bg-accent/50 p-4 text-center">
                  <p class="text-sm text-muted-foreground">
                    Enviamos um link de acesso para
                    <strong class="text-foreground">{{ email }}</strong>.
                    Verifique sua caixa de entrada.
                  </p>
                </div>
              </template>
              <template v-else>
                <div class="space-y-1.5">
                  <Label for="magic-email">E-mail</Label>
                  <Input
                    id="magic-email"
                    v-model="email"
                    type="email"
                    placeholder="seu@email.com"
                    @keyup.enter="handleMagicLink"
                  />
                </div>

                <Button
                  class="w-full"
                  :disabled="loading"
                  @click="handleMagicLink"
                >
                  {{ loading ? 'Enviando...' : 'Enviar Link de Acesso' }}
                </Button>
              </template>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
