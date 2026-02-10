import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-brand-gradient shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2"
        >
          <img
            src="/logo.png"
            alt="Cognify"
            className="h-10 w-auto object-contain sm:h-12"
          />
          <span className="text-2xl font-bold text-brand-ivory sm:text-3xl">Cognify</span>
        </Link>
        {user ? (
          <ul className="flex flex-wrap items-center gap-4">
            <li>
              <Link to="/app" className="text-white hover:text-gray-100 font-medium">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/app/train" className="text-white hover:text-gray-100 font-medium">
                Train
              </Link>
            </li>
            <li>
              <Link to="/app/history" className="text-white hover:text-gray-100 font-medium">
                History
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Logout
              </button>
            </li>
          </ul>
        ) : (
          <>
            <ul className="hidden md:flex items-center gap-6">
              <li>
                <Link to="/what-is-cognify" className="text-white hover:text-gray-100 font-medium">
                  Product
                </Link>
              </li>
              <li>
                <Link to="/who-its-for" className="text-white hover:text-gray-100 font-medium">
                  Use cases
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-white hover:text-gray-100 font-medium">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white hover:text-gray-100 font-medium">
                  About
                </Link>
              </li>
            </ul>
            <ul className="flex items-center gap-3">
              <li>
                <Link
                  to="/login"
                  className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-brand-ivory hover:opacity-90 transition-opacity"
                >
                  Try it out
                </Link>
              </li>
            </ul>
          </>
        )}
      </nav>
    </header>
  )
}
