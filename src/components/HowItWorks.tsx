const steps = [
  {
    icon: '🔗',
    title: 'Connect Wallet',
    description:
      'Link Freighter or Albedo in one click. Self-custodial, no KYC, no email — your keys, your predictions.',
  },
  {
    icon: '📊',
    title: 'Start with Practice vXLM',
    description:
      'Every new account receives 1,000 virtual XLM to explore rounds risk-free before going on-chain.',
  },
  {
    icon: '🎯',
    title: 'Submit Your Prediction',
    description:
      'Choose UP/DOWN for directional calls or Precision Mode for exact-price forecasts. Skill over luck.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="how-it-works-title">
      <h2
        id="how-it-works-title"
        className="text-center text-3xl font-bold text-white sm:text-4xl"
      >
        How It Works
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-gray-400">
        Three steps from wallet connection to on-chain prediction — built for analysts, not gamblers.
      </p>

      <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <article
            key={step.title}
            className="glass-card group rounded-2xl p-8 transition-transform duration-300 hover:-translate-y-1"
          >
            <span className="text-5xl" role="img" aria-hidden>
              {step.icon}
            </span>
            <h3 className="mt-5 text-xl font-bold text-white">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
