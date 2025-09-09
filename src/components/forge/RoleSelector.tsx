import React, { useState } from 'react';
import { RevealUp } from '../motion/Reveal';
import { AnimatedButton } from '../motion/AnimatedButton';
import { Users, Factory, Crown, ArrowRight } from 'lucide-react';

interface Role {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  cta: string;
  ctaLink: string;
  process: string;
  icon: any;
  color: string;
  shadow: string;
}

const roles: Role[] = [
  {
    id: 'farmer',
    title: 'FARMER',
    description: 'Earn crypto by recording your screen while completing tasks for AI training',
    benefits: [
      'Quality-based rewards',
      'Level up to access exclusive tasks',
      'Work from anywhere, at anytime',
      'Instant payment on your wallet'
    ],
    cta: 'Start Recording',
    ctaLink: 'https://clones.gitbook.io/clones.docs/the-forge/roles#id-2.-farmers',
    process: 'Connect wallet → Record tasks → Earn crypto',
    icon: Users,
    color: 'primary-500',
    shadow: 'shadow-neon-primary'
  },
  {
    id: 'factory',
    title: 'FACTORY CREATOR',
    description: 'Build valuable AI datasets and transform them into liquid IP tokens',
    benefits: [
      'Fund quality demonstrations',
      'Launch dataset tokens via bonding curves',
      'Earn 0.3% on all trading volume',
      'Get meta-dataset allocations'
    ],
    cta: 'Create Your Factory',
    ctaLink: 'https://clones.gitbook.io/clones.docs/the-forge/roles#id-1.-factory-creators',
    process: 'Create factory → Fund rewards → Collect quality data → Launch IP token',
    icon: Factory,
    color: 'primary-600',
    shadow: 'shadow-neon-secondary'
  },
  {
    id: 'ambassador',
    title: 'AMBASSADOR',
    description: 'Turn your network into passive income via the world\'s first on-chain referral program.',
    benefits: [
      'Lifetime revenue from referred users',
      'Transparent on-chain reward tracking',
      'Stake $CLONES for higher commission rates',
      'No limits on earning potential or network size'
    ],
    cta: 'Become an Ambassador',
    ctaLink: 'https://clones.gitbook.io/clones.docs/the-forge/roles#id-3.-ambassadors',
    process: 'Commission Tiers',
    icon: Crown,
    color: 'primary-700',
    shadow: 'shadow-neon-tertiary'
  }
];

export function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <RevealUp distance={8}>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-text-primary mb-6 tracking-wide font-system">
              Choose Your <span className="text-primary-500">Path</span>
            </h2>

          </div>
        </RevealUp>

        {/* Roles Grid - DataVault Style */}
        <RevealUp distance={6}>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="ultra-premium-data-table rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-2 gap-4 p-4 sm:p-6 border-b border-primary-500/30 bg-black/20 backdrop-blur-xl">
                <div className="text-text-secondary text-sm font-medium font-system">Role</div>
                <div className="text-text-secondary text-sm font-medium font-system text-right"></div>
              </div>

              {/* Role Rows */}
              <div className="divide-y divide-primary-500/10">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;

                  return (
                    <div key={role.id}>
                      {/* Main Row */}
                      <div
                        className={`grid grid-cols-2 gap-4 p-4 sm:p-6 hover:border-l-4 transition-all duration-300 cursor-pointer backdrop-blur-sm ${role.color === 'primary-500'
                          ? 'hover:border-l-primary-500 hover:bg-primary-500/8 hover:shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]'
                          : role.color === 'primary-600'
                            ? 'hover:border-l-primary-600 hover:bg-primary-600/8 hover:shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]'
                            : 'hover:border-l-primary-700 hover:bg-primary-700/8 hover:shadow-[inset_0_0_20px_rgba(147,51,234,0.1)]'
                          }`}
                        onClick={() => setSelectedRole(isSelected ? null : role.id)}
                      >
                        {/* Role Info */}
                        <div className="flex items-center gap-3 col-span-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${role.shadow} bg-${role.color}/25 border border-${role.color}/40`}>
                            <Icon className={`w-6 h-6 text-${role.color}`} />
                          </div>
                          <div>
                            <div className="font-medium text-text-primary font-system text-sm sm:text-base">{role.title}</div>
                            <div className="text-text-secondary text-xs sm:text-sm font-system line-clamp-2">{role.description}</div>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex items-center justify-end">
                          <button className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-system font-medium ${role.color === 'primary-500'
                            ? 'border-primary-500/40 text-primary-500 hover:bg-primary-500/10'
                            : role.color === 'primary-600'
                              ? 'border-primary-600/40 text-primary-600 hover:bg-primary-600/10'
                              : 'border-primary-700/40 text-primary-700 hover:bg-primary-700/10'
                            }`}>
                            {isSelected ? 'Collapse' : 'Explore'}
                            <ArrowRight className={`w-4 h-4 ml-1 inline transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isSelected && (
                        <div className="p-4 sm:p-6 bg-black/30 border-t border-primary-500/20">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Left Column - Description & Process/Commission */}
                            <div className="flex flex-col">
                              <h4 className="text-lg font-bold text-text-primary mb-3 font-system">How it works</h4>
                              <p className="text-text-secondary mb-4 font-system flex-grow">{role.description}</p>

                              {/* Process for non-Ambassador roles or Commission Tiers for Ambassador */}
                              <div className="text-sm text-primary-500 font-system bg-primary-500/10 rounded-lg p-3 border border-primary-500/20 mt-auto">
                                {role.id === 'ambassador' ? (
                                  <>
                                    <strong>Commission Tiers:</strong>
                                    <div className="mt-2 space-y-1">
                                      <div className="flex justify-between items-center">
                                        <span className="text-text-tertiary">0.1% $CLONES</span>
                                        <span className="text-text-tertiary">=</span>
                                        <span className="text-primary-400 font-bold">1% commission rate</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-text-tertiary">0.2% $CLONES</span>
                                        <span className="text-text-tertiary">=</span>
                                        <span className="text-primary-400 font-bold">2% commission rate</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-text-tertiary">0.3% $CLONES</span>
                                        <span className="text-text-tertiary">=</span>
                                        <span className="text-primary-400 font-bold">3% commission rate</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-text-tertiary">0.4% $CLONES</span>
                                        <span className="text-text-tertiary">=</span>
                                        <span className="text-primary-400 font-bold">4% commission rate</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-text-tertiary">0.5% $CLONES</span>
                                        <span className="text-text-tertiary">=</span>
                                        <span className="text-primary-400 font-bold">5% commission rate</span>
                                      </div>
                                      <div className="pt-1 border-t border-white/10 text-center">
                                        <p className="text-xs text-text-muted">Higher stakes = Higher rates</p>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <strong>Process:</strong>
                                    <ol className="mt-2 space-y-1">
                                      {role.process.split(' → ').map((step, idx) => (
                                        <li key={idx} className="flex items-start">
                                          <span className="text-primary-400 font-bold mr-2 flex-shrink-0">{idx + 1}.</span>
                                          <span>{step}</span>
                                        </li>
                                      ))}
                                    </ol>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Right Column - Benefits & CTA */}
                            <div className="flex flex-col">
                              <h4 className="text-lg font-bold text-text-primary mb-3 font-system">Benefits</h4>
                              <ul className="space-y-2 mb-6 flex-grow">
                                {role.benefits.map((benefit, idx) => (
                                  <li key={idx} className="flex items-center text-text-secondary text-sm font-system">
                                    <span className="text-green-400 text-lg flex-shrink-0 mr-3">✅</span>
                                    {benefit}
                                  </li>
                                ))}
                              </ul>

                              <AnimatedButton variant="primary" size="lg" className="w-full font-system mt-auto" onClick={() => window.open(role.ctaLink, '_blank', 'noopener,noreferrer')}>
                                {role.cta}
                              </AnimatedButton>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer Stats */}
              <div className="p-4 sm:p-6 bg-black/20 border-t border-primary-500/40 backdrop-blur-xl relative">
                {/* Neon accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/80 to-transparent shadow-[0_0_10px_rgba(139,92,246,0.6)]"></div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-500 font-system drop-shadow-neon-primary">
                    Building the future of AI training data
                  </div>
                  <div className="text-sm text-text-muted font-system mt-1"></div>
                </div>
              </div>
            </div>
          </div>
        </RevealUp>
      </div>
    </section>
  );
}