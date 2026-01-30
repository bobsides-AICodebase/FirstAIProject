import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './useAuth'

/**
 * Renders children (or <Outlet /> when used as a layout route) only when the user is authenticated.
 * - While loading: shows a small placeholder.
 * - No session: redirects to /login (replace).
 * - Session: renders outlet/children.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [loading, user, navigate])

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <Outlet />
}
