import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="min-w-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-transparent px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            One rep closer to clarity.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
            Cognify is a communication training platform that helps you speak clearly in
            real-world situations—interviews, client conversations, sales discussions, and
            leadership updates.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-center font-semibold text-white shadow-sm hover:bg-indigo-700 sm:w-auto"
            >
              Start training
            </Link>
            <Link
              to="/what-is-cognify"
              className="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              What is Cognify?
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Many capable people struggle to explain clearly under pressure.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            These moments are unscripted and time-constrained. Experience alone doesn’t
            give enough opportunities to practice them deliberately. Cognify creates a
            place for repeatable, low-risk speaking reps that mirror real situations—so you
            improve through repetition and feedback over time.
          </p>
          <Link
            to="/how-it-works"
            className="mt-6 inline-block font-medium text-indigo-600 hover:text-indigo-700"
          >
            See how it works →
          </Link>
        </div>
      </section>

      {/* Who it’s for */}
      <section className="bg-gradient-to-b from-gray-50/80 to-transparent px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Built for situations where speaking is tested and least often trained.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Interviews and career conversations. Sales and client discussions. Consulting
            and leadership communication. Translating complex ideas in technical,
            financial, and healthcare roles. The skill is the same: organizing thoughts
            quickly and explaining them clearly in the moment.
          </p>
          <Link
            to="/who-its-for"
            className="mt-6 inline-block font-medium text-indigo-600 hover:text-indigo-700"
          >
            Who it’s for →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Ready to train?
          </h2>
          <p className="mt-3 text-gray-600">
            Create your account and start your first speaking rep in minutes.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Start training
          </Link>
        </div>
      </section>
    </div>
  )
}
