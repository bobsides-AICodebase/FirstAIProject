import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const WHO_TITLE = 'Who Cognify Is For | Interviews, Sales, Leadership Communication'
const WHO_DESCRIPTION =
  'Cognify is for situations where speaking is tested and least trained: interviews, sales and client conversations, consulting and leadership, translating complex ideas. One skill: clarity under pressure.'

export function WhoItsFor() {
  return (
    <div className="min-w-0">
      <Helmet>
        <title>{WHO_TITLE}</title>
        <meta name="description" content={WHO_DESCRIPTION} />
        <meta property="og:title" content={WHO_TITLE} />
        <meta property="og:description" content={WHO_DESCRIPTION} />
      </Helmet>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Who it’s for
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Cognify is designed for situations where speaking is most often tested and
            least often trained. These moments require people to explain ideas clearly
            without preparation, under time pressure, and to different audiences. While the
            contexts vary, the underlying skill is the same: organizing thoughts quickly
            and explaining them clearly in the moment.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-lg bg-brand-gradient px-6 py-3 font-semibold text-brand-ivory hover:opacity-90 transition-opacity"
          >
            Start training
          </Link>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Speaking under pressure, across contexts
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Interviews and career conversations
              </h3>
              <p className="mt-2 text-gray-600">
                In interviews and promotion discussions, people are asked open-ended
                questions with no clear right answer. Cognify helps users practice
                structuring responses, prioritizing what matters, and communicating
                judgment rather than listing experience.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Sales and client conversations
              </h3>
              <p className="mt-2 text-gray-600">
                In sales and client-facing roles, the challenge is explaining value
                without relying on product jargon. Cognify helps users practice
                identifying the core problem, articulating impact, and framing solutions
                in language decision-makers care about.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Consulting and leadership communication
              </h3>
              <p className="mt-2 text-gray-600">
                In consulting and leadership roles, the work often involves explaining
                thinking out loud. Cognify helps users practice walking through problems,
                assumptions, tradeoffs, and recommendations in a clear, structured way, even
                as conversations evolve.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Translating complex ideas
              </h3>
              <p className="mt-2 text-gray-600">
                In technical, financial, and healthcare roles, the challenge is
                translation. Cognify helps users explain complex concepts, risks, and
                decisions in plain language without losing accuracy.
              </p>
            </div>
          </div>
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
