import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const HOME_TITLE = 'Cognify | Communication Training for Speaking Under Pressure'
const HOME_DESCRIPTION =
  'Cognify is the Communication Gym for real-time speaking under pressure. Deliberate practice for interviews, client conversations, sales, and leadership. Not a course—repeatable reps and immediate feedback.'

export function Home() {
  return (
    <div className="min-w-0">
      <Helmet>
        <title>{HOME_TITLE}</title>
        <meta name="description" content={HOME_DESCRIPTION} />
        <meta property="og:title" content={HOME_TITLE} />
        <meta property="og:description" content={HOME_DESCRIPTION} />
      </Helmet>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-transparent px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            One rep closer to clarity.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
            Cognify is built for real-time speaking under pressure—the unscripted,
            time-constrained moments where you’re actually evaluated: interviews, client
            conversations, sales discussions, and leadership updates. Not a course. A
            place for deliberate practice.
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
            Structure breaks under pressure—and people are judged by clarity in the moment.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Capable people are often judged not by the quality of their thinking but by
            how clearly they can express it when it matters. Cognify is the Communication
            Gym: repeatable speaking reps and immediate feedback, so you practice
            deliberately. Not a course—a system you use between real conversations.
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
