import { Link } from 'react-router-dom'

export function WhatIs() {
  return (
    <div className="min-w-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-transparent px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            What is Cognify?
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            A utility for getting better at speaking. Cognify is a communication training
            platform designed to help people speak clearly in real-world situations. It
            focuses on moments where professionals are actually evaluated: interviews,
            client conversations, sales discussions, and leadership updates.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Start training
          </Link>
        </div>
      </section>

      {/* Problem */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            The problem it addresses
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Many capable people understand their work but struggle to explain it clearly
            under pressure. These moments are unscripted and time-constrained, and
            experience alone doesn’t provide enough opportunities to practice them
            deliberately.
          </p>
          <p className="mt-6 max-w-3xl text-lg text-gray-600">
            When people struggle, it’s rarely because they lack understanding. The
            breakdown happens at the level of structure. Under pressure, people begin
            speaking before deciding what the point is. Ideas come out in the order they’re
            thought of, context is missing, and listeners have to work to follow the
            message.
          </p>
        </div>
      </section>

      {/* Why existing tools fall short */}
      <section className="bg-gradient-to-b from-gray-50/80 to-transparent px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
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
            className="mt-10 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Start training
          </Link>
        </div>
      </section>
    </div>
  )
}
