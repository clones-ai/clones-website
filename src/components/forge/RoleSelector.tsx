import React, { useState, useRef, useEffect } from 'react';
import { RevealUp } from '../motion/Reveal';
import { AnimatedButton } from '../motion/AnimatedButton';

interface Role {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  cta: string;
  process: string;
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
      'Instant crypto payment on your wallet'
    ],
    cta: 'Start Recording',
    process: 'Connect wallet → Record tasks → Earn crypto'
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
    process: 'Create factory → Fund rewards → Collect quality data → Launch IP token'
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
    process: 'Commission Tiers'
  }
];

export function RoleSelector() {
  const [activeRole, setActiveRole] = useState<string>('farmer');
  const [cursorStyle, setCursorStyle] = useState({ left: 0, width: 0, top: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const selectedRole = roles.find(role => role.id === activeRole);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const activeTab = tabRefs.current[activeRole];
    if (activeTab && tabsRef.current) {
      const tabsRect = tabsRef.current.getBoundingClientRect();
      const activeRect = activeTab.getBoundingClientRect();
      
      if (isMobile) {
        // Mobile: vertical layout, use top and height
        setCursorStyle({
          left: 8, // padding from container
          width: activeRect.width - 16, // full width minus padding
          top: activeRect.top - tabsRect.top,
          height: activeRect.height,
        });
      } else {
        // Desktop: horizontal layout, use left and width
        setCursorStyle({
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
          top: 8, // padding from container
          height: activeRect.height - 16, // full height minus padding
        });
      }
    }
  }, [activeRole, isMobile]);

  return (
    <section className="min-h-[80vh] md:min-h-screen flex flex-col justify-center py-12 md:py-24 px-4 sm:px-6 relative overflow-hidden">

      <div className="max-w-6xl mx-auto">
        <RevealUp distance={8}>
          <div className="text-center mb-8 md:mb-16 relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-text-primary mb-4 md:mb-8 tracking-wide font-sans">Choose Your Path</h2>
          </div>
        </RevealUp>

        {/* Refined Container - Less Neon */}
        <div className="relative z-10">
          <div className="ultra-premium-glass-card rounded-2xl md:rounded-3xl p-4 md:p-8 w-full max-w-6xl mx-auto">

            {/* Role Tabs */}
            <RevealUp distance={6}>
              <div className="flex justify-center mb-8">
                <div ref={tabsRef} className="flex flex-col sm:flex-row ultra-premium-glass-card rounded-xl md:rounded-2xl p-2 relative w-full">
                  {/* Sliding cursor */}
                  <div
                    className="absolute ultra-premium-glass-card border border-primary-500/40 rounded-xl transition-all duration-300 ease-out"
                    style={{
                      left: cursorStyle.left,
                      width: cursorStyle.width,
                      top: cursorStyle.top,
                      height: cursorStyle.height,
                    }}
                  />
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      ref={(el) => {
                        tabRefs.current[role.id] = el;
                      }}
                      onClick={() => setActiveRole(role.id)}
                      className={`px-4 sm:px-8 py-3 sm:py-4 rounded-lg md:rounded-xl text-sm font-medium transition-all duration-300 font-sans relative z-10 w-full sm:w-auto text-center ${activeRole === role.id
                        ? 'text-primary-400'
                        : 'text-text-tertiary hover:text-text-secondary'
                        }`}
                    >
                      {role.title}
                    </button>
                  ))}
                </div>
              </div>
            </RevealUp>

            {/* Role Content */}
            <RevealUp distance={4}>
              <div className="min-h-[500px] md:h-[650px] ultra-premium-glass-card rounded-xl md:rounded-2xl p-4 md:p-8 overflow-hidden w-full">
                <div className="h-full flex flex-col w-full">
                  {selectedRole && (
                    <div className="h-full flex flex-col transition-all duration-300 ease-out">
                      <div className="text-center mb-6 flex-shrink-0">
                        <p className="text-text-secondary max-w-4xl mx-auto text-lg md:text-xl leading-relaxed mb-6 md:mb-8 font-sans">
                          {selectedRole.description}
                        </p>
                      </div>

                      <div className="mb-6 md:mb-8 flex-1 min-h-0 w-full">
                        <div className="min-h-[300px] md:h-80 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                          <div className="space-y-3 md:space-y-4 overflow-y-auto">
                            {selectedRole.benefits.map((benefit, index) => (
                              <div key={index} className="flex items-center gap-3 text-text-secondary p-3 md:p-4 ultra-premium-glass-card rounded-lg flex-shrink-0">
                                <span className="text-green-400 text-lg md:text-xl flex-shrink-0">✅</span>
                                <span className="font-medium font-sans text-sm md:text-base">{benefit}</span>
                              </div>
                            ))}
                          </div>

                          <div className="ultra-premium-glass-card rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col justify-center text-center h-full">
                            <h4 className="text-lg md:text-xl font-medium text-text-primary mb-3 md:mb-4 text-center font-sans">
                              {selectedRole.id === 'ambassador' ? 'Commission Tiers' : 'How to get started?'}
                            </h4>
                            <div className="text-center">
                              {selectedRole.id === 'ambassador' ? (
                                <div className="space-y-1 text-xs sm:text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="text-text-tertiary">0.1% $CLONES</span>
                                    <span className="text-text-tertiary">=</span>
                                    <span className="text-primary-400 font-bold">1% commission rate</span>
                                  </div>
                                  <div className="text-text-tertiary">0.2% $CLONES = <span className="text-primary-400 font-bold">2% commission rate</span></div>
                                  <div className="text-text-tertiary">0.3% $CLONES = <span className="text-primary-400 font-bold">3% commission rate</span></div>
                                  <div className="text-text-tertiary">0.4% $CLONES = <span className="text-primary-400 font-bold">4% commission rate</span></div>
                                  <div className="text-text-tertiary">0.5% $CLONES = <span className="text-primary-400 font-bold">5% commission rate</span></div>
                                  <div className="pt-1 border-t border-white/10 text-center">
                                    <p className="text-xs text-text-muted">Higher stakes = Higher rates</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm md:text-base font-medium text-primary-400 font-sans">{selectedRole.process}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center flex-shrink-0">
                        <AnimatedButton variant="primary" size="lg" className="font-sans">
                          {selectedRole.cta}
                        </AnimatedButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </RevealUp>
          </div>
        </div>
      </div>
    </section>
  );
}