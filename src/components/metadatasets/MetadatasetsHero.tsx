import { Shield, Target, Lock } from 'lucide-react';
import { RevealUp } from '../motion/Reveal';
import { TiltCard } from '../motion/TiltCard';
import { UnifiedSpline } from '../shared/UnifiedSpline';

export function MetadatasetsHero() {
  const features = [
    {
      icon: Shield,
      title: "Elite Data Exposure",
      description: "Exposition to the best IP from the whole ecosystem",
      color: "primary-500",
      shadow: "shadow-neon-primary"
    },
    {
      icon: Target,
      title: "No Bonding Curve",
      description: "Direct DEX deployment with pre-seeded liquidity",
      color: "primary-600",
      shadow: "shadow-neon-secondary"
    },
    {
      icon: Lock,
      title: "Private Allocations",
      description: "Exclusive for $CLONES stakers, dataset creators & prior IP burners",
      color: "primary-700",
      shadow: "shadow-neon-tertiary"
    }
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Direct 3D Background Animation */}
      <div className="absolute inset-0 z-0">
        <UnifiedSpline
          url="https://prod.spline.design/2fAIr6wJHmMqG3-7/scene.splinecode"
          className="absolute inset-0"
          style={{ opacity: '0.8' }}
          loading="lazy"
          fallbackGradient="bg-gradient-to-br from-black via-primary-900/10 to-black"
        />
        {/* Primary overlay - lighter */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"></div>
        
        {/* Bottom fade-out gradient for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/60 via-black/30 to-transparent pointer-events-none z-10"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <RevealUp distance={8}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-text-primary mb-12 tracking-wide text-center font-system">
            The Blue-Chip Tier of AI Training Data
          </h2>
        </RevealUp>

        <RevealUp distance={6}>
          <div className="text-center mb-16">
            <p className="text-lg sm:text-xl text-text-secondary max-w-5xl mx-auto leading-relaxed font-system mb-8">
              Meta-datasets are the protocol's most exclusive products.<br className="hidden md:block" />
              Curated bundles of top-graded training data delivered as ultra-premium training packages.
            </p>
          </div>
        </RevealUp>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <TiltCard key={index} className="ultra-premium-glass-card rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-ultra-premium-hover">
                <RevealUp distance={4 + index}>
                  <div className={`w-16 h-16 bg-${feature.color}/25 rounded-xl flex items-center justify-center mx-auto mb-6 border border-${feature.color}/40 ${feature.shadow}`}>
                    <Icon className={`w-6 h-6 text-${feature.color}`} />
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