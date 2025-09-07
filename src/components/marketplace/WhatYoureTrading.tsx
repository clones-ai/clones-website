import { Shield, Target, Lock } from 'lucide-react';
import { RevealUp } from '../motion/Reveal';
import { TiltCard } from '../motion/TiltCard';

export function WhatYoureTrading() {
  const features = [
    {
      icon: Shield,
      title: "VFM Provenance",
      description: "Every demonstration is cryptographically verified and timestamped, ensuring authentic human expertise."
    },
    {
      icon: Target,
      title: "Quality Metrics",
      description: "AI-powered quality scoring ensures only the highest-value demonstrations make it to market."
    },
    {
      icon: Lock,
      title: "Liquid IP Rights",
      description: "Trade fractional ownership of valuable training datasets with transparent, on-chain licensing."
    }
  ];

  return (
    <section className="py-8 md:py-10 px-4 sm:px-6 relative overflow-hidden">

      <div className="max-w-6xl mx-auto">
        <RevealUp distance={8}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-text-primary mb-16 tracking-wide text-center font-system relative z-10">
            What You're Trading
          </h2>
        </RevealUp>

        <div className="grid md:grid-cols-3 gap-8 mb-16 relative z-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <TiltCard key={index} className="ultra-premium-glass-card rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-ultra-premium-hover">
                <RevealUp distance={4 + index}>
                  <div className="w-16 h-16 bg-primary-500/25 rounded-xl flex items-center justify-center mx-auto mb-6 border border-primary-500/40 shadow-neon-primary">
                    <Icon className="w-6 h-6 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-medium text-text-primary mb-4 font-system">{feature.title}</h3>
                  <p className="text-text-secondary leading-relaxed font-system">
                    {feature.description}
                  </p>
                </RevealUp>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}