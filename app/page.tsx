'use client'

import { useAuth } from '@/lib/auth-context'
import LandingPage from '@/components/landing-page'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (user && !loading) {
      redirect('/dashboard')
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return user ? null : <LandingPage />
}
