// crm/src/components/clientes/ClientesSearch.tsx
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'

export default function ClientesSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    startTransition(() => {
      if (value) {
        router.push(`${pathname}?q=${encodeURIComponent(value)}`)
      } else {
        router.push(pathname)
      }
    })
  }

  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        fontSize: 16, color: '#9ca3af', pointerEvents: 'none',
      }}>
        🔍
      </span>
      <input
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Buscar por nombre, teléfono o email..."
        style={{
          width: '100%',
          padding: '10px 14px 10px 40px',
          borderRadius: 10,
          border: '1px solid #e5e7eb',
          fontSize: 14,
          color: '#111827',
          background: 'white',
          outline: 'none',
          opacity: isPending ? 0.6 : 1,
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}