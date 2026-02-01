import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function RequestAccess() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setStatus('submitting')
    setMessage('')
    const { error } = await supabase.from('beta_requests').insert({ email: trimmed })
    if (error) {
      setStatus('error')
      if (error.code === '23505') {
        setMessage(
          "You've already requested access recently. Please try again later or email bob.sides@gmail.com."
        )
      } else {
        setMessage(error.message)
      }
      return
    }
    setStatus('success')
    setEmail('')
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="text-2xl font-bold text-gray-900">Request access</h1>
      <p className="mt-2 text-gray-600">
        We&apos;re in private beta. Enter your email to join the waitlist.
      </p>

      {status === 'success' && (
        <div className="mt-6 rounded border border-green-200 bg-green-50 p-4 text-green-800">
          <p className="font-medium">Request received</p>
          <p className="mt-1 text-sm">We&apos;ll be in touch when we open up access.</p>
        </div>
      )}

      {status !== 'success' && (
        <form onSubmit={handleSubmit} className="mt-6">
          <label htmlFor="request-access-email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="request-access-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {status === 'error' && message && (
            <p className="mt-2 text-sm text-amber-700">{message}</p>
          )}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      )}

      {status === 'success' && (
        <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to home
        </Link>
      )}
    </div>
  )
}
