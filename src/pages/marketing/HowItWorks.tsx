import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const HOW_TITLE = 'How Cognify Works | The Communication Gym & Deliberate Practice'
const HOW_DESCRIPTION =
  'Cognify works through deliberate practice: short speaking reps in the Communication Gym, frameworks without scripting, immediate feedback. Improvement that transfers to real conversations.'

export function HowItWorks() {
  return (
    <div className="min-w-0">
      <Helmet>
        <title>{HOW_TITLE}</title>
        <meta name="description" content={HOW_DESCRIPTION} />
        <meta property="og:title" content={HOW_TITLE} />
        <meta property="og:description" content={HOW_DESCRIPTION} />
      </Helmet>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            How it works
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Cognify is built on a simple idea: people get better at speaking by speaking.
            Improvement doesn’t come from watching, reading, or memorizing. It comes from
            practicing the exact skill people are expected to perform in real
            conversations.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-lg bg-brand-gradient px-6 py-3 font-semibold text-brand-ivory hover:opacity-90 transition-opacity"
          >
            Start training
          </Link>
        </div>
      </section>

      {/* Communication Gym */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            The Communication Gym
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            At the center of Cognify is the Communication Gym, where users complete short
            speaking reps that mirror real situations. Sessions are short and focused so
            users can practice regularly without preparation or setup. Each session asks
            users to explain ideas out loud under realistic constraints, such as time
            limits or audience context.
          </p>
          <p className="mt-6 max-w-3xl text-lg text-gray-600">
            Simple frameworks provide structure to support clear thinking without
            scripting what to say. For dynamic situations, Cognify also supports
            AI-simulated conversations that require users to listen, adapt, and respond
            in real time.
          </p>
        </div>
      </section>

      {/* Session flow */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl rounded-xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Practice, feedback, and improvement
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            A Cognify session starts with a prompt. Users can choose from a scenario
            library or describe a real conversation they’re preparing for. Cognify uses
            AI to configure the session around audience, time constraints, and focus
            areas so the practice mirrors real conversations.
          </p>
          <p className="mt-6 max-w-3xl text-lg text-gray-600">
            Before speaking, the user selects a simple framework to organize their
            thinking. The framework provides structure without scripting what to say.
            The user then speaks out loud without notes and within a fixed time limit.
          </p>
          <p className="mt-6 max-w-3xl text-lg text-gray-600">
            After the rep, Cognify analyzes the response and provides immediate feedback.
            Feedback focuses on clarity, structure, simplicity, pacing, and delivery.
            Rather than overwhelming the user, Cognify surfaces one primary adjustment to
            apply next.
          </p>
          <p className="mt-6 max-w-3xl text-lg text-gray-600">
            Speaking under realistic constraints reveals where structure breaks down.
            Immediate feedback makes improvement visible, and repetition turns small
            adjustments into consistent performance in real situations.
          </p>
        </div>
      </section>

      {/* Improvement that transfers */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Improvement that transfers
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Through repeated reps and immediate feedback, users build fluency in
            organizing thoughts and explaining ideas clearly under pressure. Improvement
            transfers directly to real conversations rather than staying confined to the
            app.
          </p>
          <div className="mt-14 rounded-xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <p className="text-lg font-medium text-gray-900">
              Ready to try it? Create an account and start your first speaking rep.
            </p>
            <Link
              to="/register"
              className="mt-6 inline-block rounded-lg bg-brand-gradient px-6 py-3 font-semibold text-brand-ivory hover:opacity-90 transition-opacity"
            >
              Start training
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
