// app/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="relative">
      {/* soft background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-28 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(140px 140px at 70% 30%, #14b8a655, transparent 60%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-28 h-[30rem] w-[30rem] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(160px 160px at 30% 70%, #34d39955, transparent 60%)" }}
      />

      {/* hero */}
      <section className="relative">
        <div className="mx-auto max-w-4xl px-6 pt-16 pb-6">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-slate-600 bg-white/70 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
            About this project
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            A calm, public space for careful reflection
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-700">
            A public reflection journal built with <strong>Next.js</strong> and <strong>Supabase</strong>.
            Readers can browse entries; only the author can publish and edit.
            The goal is thoughtful, charitable exploration of theology, philosophy, and spirituality.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/entries"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
            >
              {/* book icon */}
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h13a3 3 0 013 3v11H6a3 3 0 01-3-3V5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 5v14" />
              </svg>
              Read reflections
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {/* home icon */}
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-7 9 7v7a2 2 0 01-2 2h-3a2 2 0 01-2-2V13H8v6a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Back to home
            </Link>
          </div>

          {/* quick jump row */}
          <nav className="mt-6 flex flex-wrap gap-2 text-sm">
            {[
              { href: "#story", label: "My story" },
              { href: "#mission", label: "Mission & how it works" },
              { href: "#values", label: "Values" },
              { href: "#tech", label: "Tech stack" },
            ].map((i) => (
              <a
                key={i.href}
                href={i.href}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 hover:bg-slate-50"
              >
                {i.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* MY STORY — moved up */}
      <section id="story" className="relative pb-12">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-semibold text-slate-900">My story</h2>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-slate-700">
              I’m a computer science student who loves building simple, helpful tools. I also have a real
              interest in theology—even though I lean agnostic atheist. I wasn’t raised in a deeply religious home,
              though much of my family is traditionally Catholic/Christian. What’s always drawn me is the person of
              Jesus in the New Testament and what I take to be a central ethic: forgiveness and loving your neighbor.
            </p>

            <p className="mt-3 text-slate-700">
              This project is my way to slow down and study the Bible closely, on its own terms. I’m not trying
              to force a conclusion: I might find myself closer to Jesus, I might drift further, or I might just
              understand the text more honestly. Over time, I’d also like to examine other religions and their
              ideas with the same care. The “agree / wrestle” format helps me name what resonates while being
              transparent about what I still question.
            </p>

            {/* Your personal questions */}
            <p className="mt-3 text-slate-700">Some of the questions I carry:</p>
            <ul className="mt-2 list-disc pl-6 space-y-2 text-slate-700">
              <li>How can God and heaven be real—and what would that mean for identity and memory?</li>
              <li>If animals don’t have souls or heaven, why do they suffer so intensely in the wild?</li>
              <li>Is free will coherent if Jesus (or God) is truly all-knowing and knows the ending?</li>
              <li>How could anyone be joyful in heaven if loved ones aren’t there—would we know, remember, or forget?</li>
              <li>If pain is “wiped away,” am I still myself, or does removing pain change who I am?</li>
              <li>Does fine-tuning reflect design—or will future advances in genetics/physics explain it naturally?</li>
              <li>Does the Bible speak to life beyond Earth? Does it address anything in our present age that would validate its claims?</li>
            </ul>

            {/* Classic lines of critique to explore too */}
            <p className="mt-4 text-slate-700">Further lines I plan to explore (with fair-minded replies alongside):</p>
            <ul className="mt-2 list-disc pl-6 space-y-2 text-slate-700">
              <li><span className="font-medium">Divine hiddenness:</span> Why is there <em>non-resistant</em> nonbelief if a loving God wants relationship with everyone?</li>
              <li><span className="font-medium">Evidential problem of evil:</span> Do seemingly gratuitous evils—especially natural and animal suffering—count strongly against a good, all-powerful God?</li>
              <li><span className="font-medium">Religious diversity:</span> Persistent, deep disagreement among sincere seekers—what does that imply about any single tradition’s exclusive truth claims?</li>
              <li><span className="font-medium">Foreknowledge & freedom:</span> If God infallibly knows future free acts, in what sense are they free?</li>
              <li><span className="font-medium">Hell & proportional justice:</span> Are eternal outcomes compatible with perfect goodness and justice?</li>
              <li><span className="font-medium">Incoherence worries:</span> Can divine attributes and doctrines (immutability, impassibility, Trinity, Incarnation) be made coherent together?</li>
              <li><span className="font-medium">Scripture & history:</span> Textual reliability, alleged contradictions, and the epistemic weight of miracle claims vs historical method.</li>
              <li><span className="font-medium">Prayer & divine action:</span> Why do answers seem selective and ambiguous at scale?</li>
              <li><span className="font-medium">Euthyphro & moral grounding:</span> Is goodness independent of God (limiting sovereignty) or identified with God (risking arbitrariness)?</li>
              <li><span className="font-medium">Vagueness/underdetermination:</span> If salvation hinges on assent/relationship, why are key doctrines under-specified?</li>
            </ul>

            <p className="mt-4 text-slate-700">
              I’m here to read carefully, think honestly, and keep charity at the center—both toward the text and
              toward people who see it differently. If this helps you slow down and reflect too, that’s a win.
            </p>
          </div>
        </div>
      </section>

      {/* content */}
      <section className="relative pb-20">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-6">

          {/* Mission & How it works */}
          <div id="mission" className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900">Mission & how it works</h2>
            <p className="text-slate-700">
              This journal encourages slow reading and honest engagement. Each entry centers on a passage
              and includes two lenses: <strong>Why I agree</strong> (what resonates and why) and
              <strong> Why I wrestle</strong> (tensions, questions, or unresolved parts). Public comments
              are welcome and displayed after moderation to keep discussion charitable and on-topic.
            </p>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <li className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="font-medium text-slate-900">Public to read</div>
                <p className="mt-1 text-sm text-slate-600">Anyone can browse entries and (once approved) read comments.</p>
              </li>
              <li className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="font-medium text-slate-900">Private to publish</div>
                <p className="mt-1 text-sm text-slate-600">Only the author can write, edit, and approve comments.</p>
              </li>
              <li className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="font-medium text-slate-900">Two-sided reflection</div>
                <p className="mt-1 text-sm text-slate-600">Every post balances conviction with curiosity: agree &amp; wrestle.</p>
              </li>
              <li className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="font-medium text-slate-900">Simple, fast, accessible</div>
                <p className="mt-1 text-sm text-slate-600">Minimal UI, readable typography, and mobile-first layouts.</p>
              </li>
            </ul>
          </div>

          {/* Values */}
          <div id="values" className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Core values</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Charity:</strong> read others’ views in their strongest form.</li>
              <li><strong>Clarity:</strong> state claims plainly; cite texts directly.</li>
              <li><strong>Courage:</strong> face difficult passages and hard questions.</li>
              <li><strong>Accountability:</strong> welcome corrections and revise openly.</li>
            </ul>
          </div>

          {/* Tech stack */}
          <div id="tech" className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Built with</h2>
            <div className="flex flex-wrap gap-2">
              {["Next.js (App Router)", "TypeScript", "Supabase (Postgres + Auth + RLS)", "Tailwind CSS"].map(tag => (
                <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              Public reads use Row-Level Security to allow <em>select</em> on published entries, while writes
              require the owner’s authenticated session.
            </p>
          </div>

          {/* Gentle CTA */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-slate-900 font-medium">Ready to read?</div>
                <p className="text-sm text-slate-600">Browse the latest reflections or start from the beginning.</p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/entries"
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
                >
                  Explore entries
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  Go home
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
