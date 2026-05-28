'use client'

import { useEffect } from 'react'

export function DarkModeInit() {
  useEffect(() => {
    const dark = localStorage.getItem('darkMode') === 'true'
    if (dark) {
      document.body.classList.add('dark')
      document.documentElement.style.background = '#000'
    }
  }, [])

  return null
}
