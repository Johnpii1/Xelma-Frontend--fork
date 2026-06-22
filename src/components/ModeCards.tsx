export default function ModeCards() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8" aria-labelledby="modes-title">
      <h2 id="modes-title" className="text-center text-3xl font-bold text-white">
        Two Prediction Modes
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-gray-500">
        Directional consensus or precision forecasting — same infrastructure, different skill profiles.
      </p>

      <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-2">
        <article className="glass-card rounded-2xl border-2 border-[#2C4BFD]/40 p-8">
          <div className="mb-4 inline-flex rounded-full bg-[#2C4BFD]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#BEC7FE]">
            Directional
          </div>
          <h3 className="text-2xl font-bold text-white">UP/DOWN Mode</h3>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Forecast price direction before the round closes. The majority side splits the pool —
            fast rounds for market sentiment reads.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-gray-300">
            <li>• 5-minute resolution windows</li>
            <li>• Pool split by consensus</li>
            <li>• Ideal for macro trend calls</li>
          </ul>
        </article>

        <article className="glass-card accent-border-teal rounded-2xl border-2 p-8">
          <div className="mb-4 inline-flex rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
            Precision
          </div>
          <h3 className="text-2xl font-bold text-white">Precision Mode</h3>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Submit an exact price target at round close. Closest forecast wins the pool — built for
            traders who read the tape.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-gray-300">
            <li>• 15-minute analysis windows</li>
            <li>• Closest prediction wins</li>
            <li>• Higher skill ceiling</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
