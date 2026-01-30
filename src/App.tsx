import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-gray-50">
      <div className="flex gap-8">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo vite h-24" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react h-24" alt="React logo" />
        </a>
      </div>
      <h1 className="text-3xl font-semibold text-gray-900">Vite + React + TS</h1>
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          onClick={() => setCount((c) => c + 1)}
        >
          Count is {count}
        </button>
        <p className="text-gray-600">
          Edit <code className="px-2 py-1 bg-gray-200 rounded">src/App.tsx</code> and save to test HMR.
        </p>
      </div>
    </div>
  )
}

export default App
