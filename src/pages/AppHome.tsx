import { Link } from 'react-router-dom'

export function AppHome() {
  return (
    <div className="py-16 sm:py-20">
      <section className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">App Home</h1>
        <p className="mt-2 max-w-2xl text-lg text-gray-600">Record reps and view history.</p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
        <nav className="flex gap-4">
          <Link
            to="/app/train"
            className="rounded-lg bg-brand-gradient px-4 py-2.5 font-semibold text-brand-ivory hover:opacity-90 transition-opacity"
          >
            Train
          </Link>
          <Link
            to="/app/history"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            History
          </Link>
        </nav>
      </section>
    </div>
  )
}
