'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutBtn({ redirectTo }: { redirectTo: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace(redirectTo)
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'none', border: '1px solid #d1ead9',
        borderRadius: 8, padding: '5px 10px', cursor: loading ? 'default' : 'pointer',
        fontSize: 12, fontWeight: 500, color: '#5a8a72',
        opacity: loading ? 0.6 : 1,
        transition: 'border-color 0.15s, color 0.15s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2d8a54'; (e.currentTarget as HTMLButtonElement).style.color = '#2d8a54' } }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1ead9'; (e.currentTarget as HTMLButtonElement).style.color = '#5a8a72' }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      {loading ? 'Saliendo...' : 'Salir'}
    </button>
  )
}
