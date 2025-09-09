import { Users, Database, Lock, BarChart3 } from 'lucide-react';
import { RevealUp, RevealLeft, RevealRight } from '../motion/Reveal';
import { TiltCard } from '../motion/TiltCard';

export function PrivateAllocation() {
  const allocations = [
    {
      icon: Users,
      title: "$CLONES Stakers",
      allocation: "60% Allocation (600M Tokens)",
      color: "primary-500",
      shadow: "shadow-neon-primary",
      details: [
        { label: "Access Method:", value: "Private contribution" },
        { label: "Window:", value: "48-hour exclusive" },
        { label: "Limit:", value: "Stake percentage × 600M" }
      ],
      reveal: RevealLeft
    },
    {
      icon: Database,
      title: "Dataset Creators",
      allocation: "20% Allocation (200M Tokens)",
      color: "primary-600",
      shadow: "shadow-neon-secondary",
      details: [
        { label: "Access Method:", value: "Direct airdrop" },
        { label: "Payment:", value: "No payment required", valueColor: "text-green-400" },
        { label: "Formula:", value: "20% × Dataset %" }
      ],
      reveal: RevealRight
    },
    {
      icon: Lock,
      title: "IP Holders",
      allocation: "10% Allocation (100M Tokens)",
      color: "primary-700",
      shadow: "shadow-neon-tertiary",
      details: [
        { label: "Access Method:", value: "Direct airdrop" },
        { label: "Qualification:", value: "Historical burns" },
        { label: "Distribution:", value: "One burn per wallet" }
      ],
      reveal: RevealLeft
    },
    {
      icon: BarChart3,
      title: "Liquidity Pool",
      allocation: "10% Allocation (50M Tokens)",
      color: "green-500",
      shadow: "shadow-neon-success",
      details: [
        { label: "Purpose:", value: "Auto-seeded V3" },
        { label: "Mechanism:", value: "Paired with ETH" },
        { label: "Result:", value: "Instant deep liquidity", valueColor: "text-green-400" }
      ],
      reveal: RevealRight
    }
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 relative overflow-hidden">

      <div className="max-w-6xl mx-auto">
        <RevealUp distance={8}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-text-primary mb-16 tracking-wide text-center font-system relative z-10">
            Private Allocation Model
          </h2>
        </RevealUp>

        <RevealUp distance={6}>
          <div className="text-center mb-16 relative z-10">
            <p className="text-lg sm:text-xl text-text-secondary max-w-4xl mx-auto leading-relaxed font-system">
              Meta-datasets skip public bonding curves entirely, operating as exclusive private allocations followed by direct Uniswap V3 deployment.
            </p>
          </div>
        </RevealUp>

        <div className="grid md:grid-cols-2 gap-8 mb-12 relative z-10">
          {allocations.map((allocation, index) => {
            const Icon = allocation.icon;
            const RevealComponent = allocation.reveal;
            return (
              <TiltCard key={index} className="ultra-premium-glass-card rounded-2xl p-8 transition-all duration-300 hover:shadow-ultra-premium-hover">
                <RevealComponent distance={6 + index}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${allocation.shadow} ${allocation.color === 'green-500'
                        ? 'bg-green-500/20 border border-green-500/40'
                        : allocation.color === 'primary-500'
                          ? 'bg-primary-500/25 border border-primary-500/40'
                          : allocation.color === 'primary-600'
                            ? 'bg-primary-600/25 border border-primary-600/40'
                            : 'bg-primary-700/25 border border-primary-700/40'
                      }`}>
                      <Icon className={`w-6 h-6 ${allocation.color === 'green-500'
                          ? 'text-green-500'
                          : allocation.color === 'primary-500'
                            ? 'text-primary-500'
                            : allocation.color === 'primary-600'
                              ? 'text-primary-600'
                              : 'text-primary-700'
                        }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-text-primary font-system">{allocation.title}</h3>
                      <p className={`text-sm font-system ${allocation.color === 'green-500'
                          ? 'text-green-500'
                          : allocation.color === 'primary-500'
                            ? 'text-primary-500'
                            : allocation.color === 'primary-600'
                              ? 'text-primary-600'
                              : 'text-primary-700'
                        }`}>{allocation.allocation}</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    {allocation.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex justify-between">
                        <span className="text-text-secondary font-system">{detail.label}</span>
                        <span className={`${detail.valueColor || 'text-text-primary'} font-system`}>{detail.value}</span>
                      </div>
                    ))}
                  </div>
                </RevealComponent>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}