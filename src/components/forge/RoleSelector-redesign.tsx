import React, { useState } from 'react';
import { RevealUp } from '../motion/Reveal';
import { TiltCard } from '../motion/TiltCard';
import { Users, Factory, Crown, ArrowRight, Zap, DollarSign, TrendingUp } from 'lucide-react';

interface Role {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  cta: string;
  process: string;
  icon: any;
  color: string;
  shadow: string;
  earnings: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeCommitment: string;
}

const roles: Role[] = [
  {
    id: 'farmer',
    title: 'FARMER',
    subtitle: 'Data Collector',
    description: 'Earn crypto by recording your screen while completing tasks for AI training',
    benefits: [
      'Quality-based rewards',
      'Level up to access exclusive tasks',
      'Work from anywhere, at anytime',
      'Instant payment on your wallet'
    ],
    cta: 'Start Recording',
    process: 'Connect wallet → Record tasks → Earn crypto',
    icon: Users,
    color: 'primary-500',
    shadow: 'shadow-neon-primary',
    earnings: '$50-200/day',
    difficulty: 'Beginner',
    timeCommitment: '2-8 hours/day'
  },
  {
    id: 'factory',
    title: 'FACTORY CREATOR',
    subtitle: 'Dataset Builder',
    description: 'Build valuable AI datasets and transform them into liquid IP tokens',
    benefits: [
      'Fund quality demonstrations',
      'Launch dataset tokens via bonding curves',
      'Earn 0.3% on all trading volume',
      'Get meta-dataset allocations'
    ],
    cta: 'Create Your Factory',
    process: 'Create factory → Fund rewards → Collect quality data → Launch IP token',
    icon: Factory,
    color: 'primary-600',
    shadow: 'shadow-neon-secondary',
    earnings: '$500-5K/month',
    difficulty: 'Intermediate',
    timeCommitment: '10-20 hours setup'
  },
  {
    id: 'ambassador',
    title: 'AMBASSADOR',
    subtitle: 'Network Builder',
    description: 'Turn your network into passive income via the world\'s first on-chain referral program',
    benefits: [
      'Lifetime revenue from referred users',
      'Transparent on-chain reward tracking',
      'Stake $CLONES for higher commission rates',
      'No limits on earning potential or network size'
    ],
    cta: 'Become an Ambassador',
    process: 'Commission Tiers',
    icon: Crown,
    color: 'primary-700',
    shadow: 'shadow-neon-tertiary',
    earnings: '$1K-50K/month',
    difficulty: 'Advanced',
    timeCommitment: 'Ongoing network building'
  }
];

const difficultyColors = {
  'Beginner': 'text-green-400',
  'Intermediate': 'text-yellow-400',
  'Advanced': 'text-red-400'
};

export function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <RevealUp distance={8}>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-text-primary mb-6 tracking-wide font-system">
              Choose Your <span className="text-primary-500">Role</span>
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto font-system">
              Multiple paths to earn in the AI economy. Pick the role that matches your skills and time commitment.
            </p>
          </div>
        </RevealUp>

        {/* Roles Grid - Premium Data Table Style */}
        <RevealUp distance={6}>
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl overflow-hidden bg-black/20 backdrop-blur-xl border border-primary-500/20">

              {/* Table Header */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 p-6 border-b border-primary-500/30 bg-black/20">
                <div className="text-text-secondary text-sm font-medium font-system">Role</div>
                <div className="text-text-secondary text-sm font-medium font-system text-center hidden sm:block">Earnings</div>
                <div className="text-text-secondary text-sm font-medium font-system text-center hidden sm:block">Difficulty</div>
                <div className="text-text-secondary text-sm font-medium font-system text-center">Time</div>
                <div className="text-text-secondary text-sm font-medium font-system text-center hidden sm:block">Benefits</div>
                <div className="text-text-secondary text-sm font-medium font-system text-center hidden sm:block">Process</div>
                <div className="text-text-secondary text-sm font-medium font-system text-center">Action</div>
              </div>

              {/* Role Rows */}
              <div className="divide-y divide-primary-500/10">
                {roles.map((role, index) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;

                  return (
                    <div key={role.id}>
                      {/* Main Row */}
                      <div
                        className={`grid grid-cols-4 sm:grid-cols-7 gap-4 p-6 hover:border-l-4 transition-all duration-300 cursor-pointer backdrop-blur-sm hover:border-l-${role.color} hover:bg-${role.color}/5 hover:shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]`}
                        onClick={() => setSelectedRole(isSelected ? null : role.id)}
                      >
                        {/* Role Info */}
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role.shadow} bg-${role.color}/25 border border-${role.color}/40`}>
                            <Icon className={`w-6 h-6 text-${role.color}`} />
                          </div>
                          <div>
                            <div className="font-bold text-text-primary text-sm font-system">{role.title}</div>
                            <div className="text-xs text-text-muted font-system">{role.subtitle}</div>
                          </div>
                        </div>

                        {/* Earnings */}
                        <div className={`text-center font-bold font-system hidden sm:flex items-center justify-center text-${role.color}`}>
                          <DollarSign className="w-4 h-4 mr-1" />
                          {role.earnings}
                        </div>

                        {/* Difficulty */}
                        <div className={`text-center font-medium font-system hidden sm:flex items-center justify-center ${difficultyColors[role.difficulty]}`}>
                          {role.difficulty}
                        </div>

                        {/* Time */}
                        <div className="text-center text-text-secondary text-sm font-system flex items-center justify-center">
                          {role.timeCommitment}
                        </div>

                        {/* Benefits Count */}
                        <div className="text-center font-system hidden sm:flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
                          <span className="text-text-secondary text-sm">{role.benefits.length} benefits</span>
                        </div>

                        {/* Process Indicator */}
                        <div className="text-center font-system hidden sm:flex items-center justify-center">
                          <Zap className="w-4 h-4 text-primary-500" />
                        </div>

                        {/* Action */}
                        <div className="flex items-center justify-center">
                          <button className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-system font-medium border-${role.color}/40 text-${role.color} hover:bg-${role.color}/10`}>
                            {isSelected ? 'Collapse' : 'Explore'}
                            <ArrowRight className={`w-4 h-4 ml-1 inline transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isSelected && (
                        <div className="p-6 bg-black/30 border-t border-primary-500/20">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Left Column - Description & Process */}
                            <div>
                              <h4 className="text-lg font-bold text-text-primary mb-3 font-system">How it works</h4>
                              <p className="text-text-secondary mb-4 font-system">{role.description}</p>
                              <div className="text-sm text-primary-500 font-system bg-primary-500/10 rounded-lg p-3 border border-primary-500/20">
                                <strong>Process:</strong> {role.process}
                              </div>
                            </div>

                            {/* Right Column - Benefits & CTA */}
                            <div>
                              <h4 className="text-lg font-bold text-text-primary mb-3 font-system">Benefits</h4>
                              <ul className="space-y-2 mb-6">
                                {role.benefits.map((benefit, idx) => (
                                  <li key={idx} className="flex items-center text-text-secondary text-sm font-system">
                                    <div className={`w-2 h-2 rounded-full bg-${role.color} mr-3 flex-shrink-0`}></div>
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                              <button className={`w-full py-3 px-6 rounded-xl font-bold font-system transition-all duration-200 bg-${role.color} text-white hover:bg-${role.color}/80 hover:shadow-lg`}>
                                {role.cta}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer Stats */}
              <div className="p-6 bg-black/20 border-t border-primary-500/40">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-500 font-system">
                    Building the future of AI training data
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealUp>
      </div>
    </section>
  );
}