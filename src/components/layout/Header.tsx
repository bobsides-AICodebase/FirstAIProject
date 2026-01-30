import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="text-lg font-semibold text-gray-900">
          App
        </Link>
        <ul className="flex items-center gap-4">
          <li>
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/app" className="text-gray-600 hover:text-gray-900">
                  App
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}
