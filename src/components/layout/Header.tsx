import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import logo from '../../assets/cognify-logo.png'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl"
        >
          <img
            src={logo}
            alt="Cognify logo"
            className="h-14 max-w-[220px] w-auto object-contain sm:h-16"
          />
          <span className="hidden sm:inline"></span>
        </Link>
        <ul className="flex flex-wrap items-center gap-4">
          {user ? (
            <>
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
              </li>
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
            <>
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/what-is-cognify" className="text-gray-600 hover:text-gray-900">
                  What is Cognify
                </Link>
              </li>
              <li>
                <Link to="/who-its-for" className="text-gray-600 hover:text-gray-900">
                  Who it&apos;s for
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-gray-900">
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Start training
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}
