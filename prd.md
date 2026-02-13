Aqui está uma proposta de **Documento de Requisitos do Produto (PRD)** para o MVP do sistema de ação social da Igreja Presbiteriana Metropolitana, estruturado para um desenvolvimento ágil com foco na sua stack preferida (Vite + Supabase).

Considerando seu perfil técnico e de growth, incluí uma seção de dados e webhooks mais detalhada para facilitar futuras integrações com ferramentas de análise ou CRM.

***

# PRD: Sistema de Gestão Diaconal - IPM Campinas (MVP)

| **Versão** | 1.0 (MVP) |
| :--- | :--- |
| **Status** | Rascunho Inicial |
| **Objetivo** | Centralizar e rastrear o fluxo de doações (entrada/saída) da Junta Diaconal para garantir transparência, organização e agilidade no atendimento social. |
| **Público-Alvo** | Diáconos (Admin) e Voluntários/Membros da Igreja. |

## 1. Visão Geral do Produto
O **Diaconia App** é uma aplicação web responsiva (PWA capable) desenvolvida para substituir planilhas e anotações manuais. Ele gerencia o ciclo de vida da doação: desde o recebimento do item na igreja até a entrega final ao beneficiário, mantendo um histórico auditável e gerando notificações automáticas via webhooks.

## 2. Personas e Permissões
O sistema utilizará **RBAC (Role-Based Access Control)** simples via Supabase Auth + Tabela Pública de Perfis.

### 2.1. Administrador (Diácono/Líder)
*   **Acesso:** Total.
*   **Responsabilidades:** Gerenciar usuários, cadastrar entidades beneficiárias sensíveis, visualizar relatórios gerenciais, configurar webhooks.

### 2.2. Membro (Voluntário)
*   **Acesso:** Restrito.
*   **Responsabilidades:** Registrar entrada de doações (triagem), registrar saídas (entregas), visualizar estoque disponível. Não pode excluir registros históricos ou ver dados sensíveis de outras entregas sem permissão.

***

## 3. Requisitos Funcionais (RF)

### RF01: Autenticação e Perfis [Supabase Auth]
*   Login via E-mail/Senha ou Magic Link.
*   Cadastro de usuário deve ser aprovado por um Admin ou pré-inserido (White-list) para evitar acessos externos não autorizados.
*   Vinculação automática de `auth.uid` com uma tabela `public.profiles` que contém o campo `role` ('admin' ou 'member').

OBS: dados do supabase já estão no .env

### RF02: Gestão de Inventário (Entradas)
*   Formulário de "Nova Doação Recebida".
*   **Campos:** Doador (Opcional/Anônimo), Tipo de Item (Alimento, Roupa, Móvel, Financeiro), Quantidade/Peso, Data de Recebimento, Data de Validade (Obrigatório se perecível).
*   **Mídia:** Upload de foto do item recebido (comprovante visual da qualidade/estado) [Supabase Storage].

### RF03: Cadastro de Beneficiários (Entidades)
*   Cadastro de **Pessoas Físicas** (Famílias assistidas) e **Instituições** (ONGs, Asilos).
*   **Campos:** Nome, Documento (CPF/CNPJ - mascarado), Endereço, Contato, Responsável, Status (Ativo/Inativo).
*   *Nota de Privacidade:* Apenas Admins podem ver dados sensíveis de contato de famílias.

### RF04: Registro de Saídas (Doações)
*   Baixa no estoque vinculada a um Beneficiário.
*   **Campos:** Quem entregou (User Logado), Beneficiário (Select), Itens/Qtd, Data da Entrega.
*   **Evidência:** Upload de foto da entrega (assinatura de recibo ou foto da entrega no local).

### RF05: Relatórios Básicos
*   Dashboard inicial com métricas do mês: "Total de Cestas Entregues", "Itens a Vencer", "Total de Famílias Atendidas".
*   Listagem filtrável de Entradas e Saídas (Data, Tipo, Beneficiário).

### RF06: Integração e Webhooks
*   O sistema deve disparar um POST para uma URL configurada (ex: n8n, Zapier ou API própria) em dois eventos críticos:
    1.  `donation_received`: Quando uma doação grande entra.
    2.  `donation_delivered`: Confirmação de entrega.
*   *Uso Prático:* Isso permite enviar uma mensagem automática no WhatsApp do Diácono chefe avisando que chegou doação, ou alimentar um Google Data Studio externo.

***

## 4. Arquitetura de Dados (Sugestão Supabase)

Para garantir o MVP, a estrutura relacional deve ser simples.

### Tabelas Principais
1.  **`profiles`**: Extensão do usuário.
    *   `id` (FK auth.users), `full_name`, `role` (enum: admin, member), `avatar_url`.
2.  **`beneficiaries`**: Quem recebe.
    *   `id`, `name`, `type` (family/org), `contact_info`, `active`.
3.  **`inventory_items`** (Entradas):
    *   `id`, `created_at`, `item_name`, `category`, `quantity`, `expiry_date`, `photo_url`, `created_by` (FK profiles).
4.  **`donation_movements`** (Saídas/Log):
    *   `id`, `beneficiary_id` (FK), `items_json` (quais itens e qtd saíram), `delivered_at`, `evidence_photo_url`, `delivered_by` (FK profiles).

*Nota: Use RLS (Row Level Security) no Supabase para garantir que apenas Admins possam fazer `DELETE` ou `UPDATE` em registros antigos.*

***

## 5. Especificações Técnicas e Stack

*   **Frontend:** Vite + React (ou Vue) + TailwindCSS (para UI rápida).
*   **Backend/Baas:** Supabase.
    *   **Database:** PostgreSQL.
    *   **Auth:** Gerenciamento de sessão.
    *   **Storage:** Bucket `donations-evidence` (com regras de apenas leitura pública ou URLs assinadas).
    *   **Edge Functions (Opcional):** Para processar os webhooks se não quiser fazer direto no client-side.
*   **Hospedagem:** Vercel ou Netlify (Integração nativa com Vite).

***

## 6. Exemplo de Payload do Webhook (RF06)

Para facilitar sua automação (pensando no seu background de Growth), o payload JSON enviado pelo webhook de saída seria:

```json
{
  "event": "donation_delivered",
  "timestamp": "2026-02-12T19:00:00Z",
  "data": {
    "beneficiary": "Instituição Lar dos Velhinhos",
    "delivered_by": "João Diácono",
    "items": [
      { "item": "Cesta Básica", "qty": 5 },
      { "item": "Leite", "qty": 12 }
    ],
    "evidence_url": "https://supabase.../storage/img_123.jpg"
  }
}
```

## 7. Próximos Passos (Pós-MVP)
*   **Geração de PDF:** Botão para imprimir recibo de entrega na hora.
*   **Gestão de Validade:** Alerta automático por e-mail 7 dias antes de itens perecíveis vencerem.
*   **Campanhas:** Módulo para criar "Metas de Arrecadação" (ex: Campanha do Agasalho) e acompanhar progresso.

