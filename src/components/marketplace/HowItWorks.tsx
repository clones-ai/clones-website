import { Reveal, RevealUp } from '../motion/Reveal';
import { TiltCard } from '../motion/TiltCard';

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Dataset Creation",
      description: "Demonstrations are packaged into datasets & launched via bonding curve. Creator sets burn % for IP access.",
      bgColor: "bg-primary-500/25",
      borderColor: "border-primary-500/40",
      textColor: "text-primary-500",
      shadowClass: "shadow-neon-primary"
    },
    {
      number: "2",
      title: "Trade the Curve",
      description: "Community drives price discovery. Burn-to-download remains disabled to protect IP dilution.",
      bgColor: "bg-primary-600/25",
      borderColor: "border-primary-600/40",
      textColor: "text-primary-600",
      shadowClass: "shadow-neon-secondary"
    },
    {
      number: "3",
      title: "Graduation",
      description: "Liquidity is migrated to DEX & BURNT. The Burn Portal activates for token holders to download datasets.",
      bgColor: "bg-primary-700/25",
      borderColor: "border-primary-700/40",
      textColor: "text-primary-700",
      shadowClass: "shadow-neon-tertiary"
    }
  ];

  return (
    <section className="py-8 md:py-10 px-4 sm:px-6 relative overflow-hidden">

      <div className="max-w-6xl mx-auto">
        <RevealUp distance={8}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-text-primary mb-16 tracking-wide text-center font-system relative z-10">
            How it Works
          </h2>
        </RevealUp>

        <div className="grid md:grid-cols-3 gap-8 mb-16 relative z-10">
          {steps.map((step) => (
            <TiltCard
              key={step.number}
              className="ultra-premium-glass-card rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-ultra-premium-hover min-h-[280px] flex flex-col justify-between"
            >
              <RevealUp distance={8}>
                <div className={`w-16 h-16 ${step.bgColor} rounded-xl flex items-center justify-center mx-auto mb-6 border ${step.borderColor} ${step.shadowClass}`}>
                  <span className={`${step.textColor} font-bold text-xl font-system`}>{step.number}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-text-primary mb-4 font-system">{step.title}</h3>
                  <p className="text-text-secondary leading-relaxed font-system">
                    {step.description}
                  </p>
                </div>
              </RevealUp>
            </TiltCard>
          ))}
        </div>
      </div>

    </section>
  );
}