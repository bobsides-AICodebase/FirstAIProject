import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const WHAT_IS_TITLE = 'What is Cognify? | Communication Training & Speaking Practice'
const WHAT_IS_DESCRIPTION =
  'Cognify is a utility for getting better at speaking under pressure. Focus on unscripted, time-constrained moments: interviews, client and sales conversations, leadership updates. The Communication Gym—not a course.'

export function WhatIs() {
  return (
    <div className="min-w-0">
      <Helmet>
        <title>{WHAT_IS_TITLE}</title>
        <meta name="description" content={WHAT_IS_DESCRIPTION} />
        <meta property="og:title" content={WHAT_IS_TITLE} />
        <meta property="og:description" content={WHAT_IS_DESCRIPTION} />
      </Helmet>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            What is Cognify?
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            A utility for getting better at speaking under pressure. Cognify focuses on
            the unscripted, time-constrained moments where professionals are actually
            evaluated: interviews, client conversations, sales discussions, and leadership
            updates. Not a course—the Communication Gym gives you repeatable speaking reps
            and immediate feedback for deliberate practice.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-lg bg-brand-gradient px-6 py-3 font-semibold text-brand-ivory hover:opacity-90 transition-opacity"
          >
            Start training
          </Link>
        </div>
      </section>

      {/* Problem */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Structure breaks under pressure—and people are judged by clarity in the moment.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Many capable people understand their work but struggle to explain it clearly
            when it matters. These moments are unscripted and time-constrained; experience
            alone doesn’t give enough deliberate practice. When people struggle, it’s
            rarely understanding—it’s structure. Under pressure, people speak before
            deciding the point. Ideas come out in thought order, context is missing, and
            listeners work to follow. Cognify trains that gap: the Communication Gym
            offers repeatable reps and immediate feedback, not a course.
          </p>
        </div>
      </section>

      {/* Why existing tools fall short */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl rounded-xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Why existing tools fall short
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Most communication tools aren’t designed for this problem. Content helps
            people recognize good communication but doesn’t train execution under
            pressure. Scripts break when conversations shift. Feedback often arrives too
            late to apply, and coaching doesn’t provide enough repetition to build
            fluency.
          </p>
          <p className="mt-6 max-w-3xl text-lg text-gray-600">
            As a result, capable people are judged not by the quality of their thinking,
            but by how clearly they can express it in the moment. Cognify is designed to
            train that exact gap.
          </p>
        </div>
      </section>

      {/* How Cognify fills the gap */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            How Cognify fills the gap
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Cognify creates a place for repeatable, low-risk speaking reps that mirror
            real situations. Users train by explaining ideas out loud under realistic
            constraints, improving through repetition and feedback over time.
          </p>
          <p className="mt-6 max-w-3xl text-lg text-gray-600">
            Cognify isn’t a course or content library. It’s a system people use between
            real conversations to get better at speaking when it matters.
          </p>
          <Link
            to="/register"
            className="mt-10 inline-block rounded-lg bg-brand-gradient px-6 py-3 font-semibold text-brand-ivory hover:opacity-90 transition-opacity"
          >
            Start training
          </Link>
        </div>
      </section>
    </div>
  )
}
