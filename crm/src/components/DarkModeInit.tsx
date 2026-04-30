'use client'

import { useEffect } from 'react'

export function DarkModeInit() {
  useEffect(() => {
    const dark = localStorage.getItem('darkMode') === 'true'
    if (dark) document.body.classList.add('dark')
  }, [])

  return null
}
