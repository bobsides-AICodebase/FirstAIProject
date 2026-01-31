import { Link } from 'react-router-dom'

export function AppHome() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-900">App Home</h1>
      <p className="mt-2 text-gray-600">Record reps and view history.</p>
      <nav className="mt-6 flex gap-4">
        <Link
          to="/app/train"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Train
        </Link>
        <Link
          to="/app/history"
          className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          History
        </Link>
      </nav>
    </div>
  )
}
