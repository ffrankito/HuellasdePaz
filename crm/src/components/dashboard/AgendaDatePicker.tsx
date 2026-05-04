'use client'

import { useRouter } from 'next/navigation'

export function AgendaDatePicker({ value }: { value: string }) {
  const router = useRouter()
  return (
    <input
      type="date"
      defaultValue={value}
      onChange={(e) => {
        if (e.target.value) router.push(`/dashboard/agenda?fecha=${e.target.value}`)
      }}
      style={{
        padding: '7px 10px', borderRadius: 10, fontSize: 13,
        border: '1px solid #e5e7eb', background: 'white',
        color: '#374151', cursor: 'pointer',
      }}
    />
  )
}