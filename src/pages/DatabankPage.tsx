import React from 'react';

export default function DatabankPage() {
  return (
    <div className="bg-clones-bg-primary text-clones-text-primary min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-clones-accent-tertiary/5 to-transparent"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-clones-accent-tertiary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-clones-accent-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-light text-clones-text-primary tracking-wide mb-8 leading-tight">
            The DataBank
          </h1>
          <p className="text-xl text-clones-text-tertiary max-w-4xl mx-auto leading-relaxed">
            Own a share of the world's most valuable AI dataset.
          </p>
        </div>
      </section>

      {/* Section 1: What is the DataBank? */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-clones-text-primary mb-6 tracking-wide">What is the DataBank?</h2>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary border border-white/10 rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-tertiary/10 via-transparent to-clones-accent-primary/10"></div>
              <div className="relative text-center">
                <div className="text-6xl mb-8 animate-float">🏛️</div>
                <p className="text-2xl text-clones-text-secondary leading-relaxed max-w-4xl mx-auto mb-8">
                  A meta-layer aggregating every dataset, every workflow, every insight collected by CLONES.
                </p>
                <p className="text-lg text-clones-text-tertiary max-w-3xl mx-auto leading-relaxed">
                  The DataBank represents the collective intelligence of millions of computer interactions, 
                  creating the most comprehensive training resource for AI agents ever assembled.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative flex justify-center py-8">
        <div className="relative">
          <div className="w-96 h-px bg-gradient-to-r from-transparent via-clones-accent-tertiary/40 to-transparent"></div>
          <div className="absolute inset-0 w-96 h-px bg-gradient-to-r from-transparent via-clones-accent-primary/30 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Section 2: Revenue Sharing Model */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-clones-text-primary mb-6 tracking-wide">Revenue Sharing Model</h2>
            <p className="text-xl text-clones-text-tertiary max-w-3xl mx-auto">
              Direct participation in the value you help create
            </p>
          </div>

          {/* Revenue Flow Graphic */}
          <div className="relative mb-12">
            <div className="bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary border border-white/10 rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-primary/5 via-transparent to-clones-accent-tertiary/5"></div>
              <div className="relative">
                {/* Flow Diagram */}
                <div className="flex items-center justify-center gap-8 mb-8">
                  {/* Enterprise Revenue */}
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-clones-accent-secondary to-clones-accent-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                      <span className="text-white font-bold text-2xl">💼</span>
                    </div>
                    <h3 className="text-lg font-medium text-clones-text-primary mb-2">Enterprise Revenue</h3>
                    <p className="text-sm text-clones-text-tertiary">AI companies pay for datasets</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center">
                    <svg className="w-12 h-12 text-clones-accent-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>

                  {/* 50% Split */}
                  <div className="text-center">
                    <div className="w-32 h-24 bg-gradient-to-br from-clones-accent-tertiary to-clones-accent-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                      <span className="text-white font-bold text-3xl">50%</span>
                    </div>
                    <h3 className="text-lg font-medium text-clones-text-primary mb-2">Revenue Share</h3>
                    <p className="text-sm text-clones-text-tertiary">Distributed to token holders</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center">
                    <svg className="w-12 h-12 text-clones-accent-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>

                  {/* Token Holders */}
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-clones-accent-primary to-clones-accent-tertiary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                      <span className="text-white font-bold text-2xl">🪙</span>
                    </div>
                    <h3 className="text-lg font-medium text-clones-text-primary mb-2">$CLONES Holders</h3>
                    <p className="text-sm text-clones-text-tertiary">Receive proportional rewards</p>
                  </div>
                </div>

                {/* Key Message */}
                <div className="text-center bg-clones-panel-elevated/50 rounded-2xl p-8 border border-white/5">
                  <h3 className="text-3xl font-medium text-clones-text-primary mb-4 bg-gradient-to-r from-clones-accent-primary to-clones-accent-tertiary bg-clip-text text-transparent">
                    50% of enterprise revenue → $CLONES token holders
                  </h3>
                  <p className="text-lg text-clones-text-tertiary">
                    Every dataset sale, every enterprise license, every API call generates revenue that flows directly back to the community
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative flex justify-center py-8">
        <div className="relative">
          <div className="w-96 h-px bg-gradient-to-r from-transparent via-clones-accent-primary/40 to-transparent"></div>
          <div className="absolute inset-0 w-96 h-px bg-gradient-to-r from-transparent via-clones-accent-tertiary/30 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Section 3: Why hold $CLONES? */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-clones-text-primary mb-6 tracking-wide">Why hold $CLONES?</h2>
            <p className="text-xl text-clones-text-tertiary max-w-3xl mx-auto">
              More than just a token — it's ownership in the future of AI training
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Revenue Share */}
            <div className="bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary border border-white/10 rounded-2xl p-8 relative overflow-hidden hover:border-clones-accent-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(139,92,246,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-primary/5 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-clones-accent-primary to-clones-accent-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                  <span className="text-white text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-medium text-clones-text-primary mb-4 text-center">Revenue Share</h3>
                <p className="text-clones-text-tertiary text-center leading-relaxed">
                  Receive 50% of all enterprise revenue proportional to your token holdings. The more the ecosystem grows, the more you earn.
                </p>
              </div>
            </div>

            {/* Ecosystem Exposure */}
            <div className="bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary border border-white/10 rounded-2xl p-8 relative overflow-hidden hover:border-clones-accent-secondary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-secondary/5 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-clones-accent-secondary to-clones-accent-tertiary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <span className="text-white text-2xl">🌐</span>
                </div>
                <h3 className="text-xl font-medium text-clones-text-primary mb-4 text-center">Full Ecosystem Exposure</h3>
                <p className="text-clones-text-tertiary text-center leading-relaxed">
                  Benefit from growth across Forge, Marketplace, and DataBank. One token, complete exposure to the AI training revolution.
                </p>
              </div>
            </div>

            {/* Network Effects */}
            <div className="bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary border border-white/10 rounded-2xl p-8 relative overflow-hidden hover:border-clones-accent-tertiary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(236,72,153,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-tertiary/5 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-clones-accent-tertiary to-clones-accent-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                  <span className="text-white text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-medium text-clones-text-primary mb-4 text-center">Network Effects</h3>
                <p className="text-clones-text-tertiary text-center leading-relaxed">
                  As more contributors join and datasets grow, the value compounds. Early holders benefit most from exponential network growth.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary border border-white/10 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-medium text-clones-text-primary mb-6 text-center">Additional Benefits</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-clones-accent-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-clones-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-clones-text-secondary">Higher referral commission rates</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-clones-accent-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-clones-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-clones-text-secondary">Priority access to new features</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-clones-accent-tertiary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-clones-accent-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-clones-text-secondary">Governance voting rights</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-clones-accent-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-clones-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-clones-text-secondary">Exclusive dataset access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light text-clones-text-primary mb-6 tracking-wide">
            Ready to Own the Future of AI?
          </h2>
          <p className="text-xl text-clones-text-tertiary mb-12 max-w-2xl mx-auto">
            Join the revolution and start earning from the world's most valuable AI dataset
          </p>
          
          <button className="group inline-flex items-center gap-4 px-12 py-5 bg-gradient-to-r from-clones-accent-primary via-clones-accent-secondary to-clones-accent-tertiary hover:from-clones-accent-primary/80 hover:via-clones-accent-secondary/80 hover:to-clones-accent-tertiary/80 text-white rounded-xl transition-all duration-300 font-medium text-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-clones-accent-primary via-clones-accent-secondary to-clones-accent-tertiary opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-glow-pulse"></div>
            <span className="relative">Learn About $CLONES</span>
            <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
          
          <p className="text-sm text-clones-text-muted mt-6">
            Token launch coming soon • Join waitlist for early access
          </p>
        </div>
      </section>
    </div>
  );
}