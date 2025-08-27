'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { toast } from '@/hooks/use-toast'

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { redirectTo?: string; requireAuth?: boolean } = {}
) {
  const { redirectTo = '/', requireAuth = true } = options

  return function WithAuth(props: P) {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (loading) return
      
      if (requireAuth && !isAuthenticated) {
        toast({
          title: 'Authentication Required',
          description: 'You need to be logged in to access this page',
          variant: 'destructive',
        })
        router.push(redirectTo)
      }
    }, [isAuthenticated, loading, redirectTo, router])

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!isAuthenticated && requireAuth) {
      return null
    }

    return <Component {...(props as P)} />
  }
}
