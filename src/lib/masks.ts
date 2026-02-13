export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

export function maskDocument(doc: string | null): string {
  if (!doc) return '---'
  const digits = doc.replace(/\D/g, '')
  if (digits.length <= 11) {
    return `***.${digits.slice(3, 6)}.***-**`
  }
  return `**.***.${digits.slice(4, 7)}/****-**`
}

export function formatDocument(value: string, type: 'family' | 'org'): string {
  return type === 'family' ? formatCPF(value) : formatCNPJ(value)
}
