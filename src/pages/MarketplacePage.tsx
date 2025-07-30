import React from 'react';

export default function MarketplacePage() {
  return (
    <div className="bg-clones-bg-primary text-clones-text-primary min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-clones-accent-secondary/5 to-transparent"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-clones-accent-secondary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-clones-accent-tertiary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-light text-clones-text-primary tracking-wide mb-8 leading-tight">
            The Marketplace
          </h1>
          <p className="text-xl text-clones-text-tertiary max-w-4xl mx-auto leading-relaxed">
            The first on-chain exchange for CUA datasets.
          </p>
        </div>
      </section>

      {/* Section 1: Buy Datasets */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-clones-text-primary mb-6 tracking-wide">Buy Datasets</h2>
            <p className="text-xl text-clones-text-tertiary max-w-3xl mx-auto">
              Access premium computer interaction datasets with transparent pricing and quality guarantees
            </p>
          </div>

          {/* Dataset Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Dataset Card 1 */}
            <div className="group relative bg-gradient-to-br from-clones-panel-main/60 to-clones-panel-secondary/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-clones-accent-secondary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-secondary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                {/* Quality Score Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                    Quality: 9.2/10
                  </div>
                  <div className="text-clones-accent-secondary font-mono text-2xl font-bold">
                    $2,500
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-clones-text-primary mb-3">
                  Web Development Workflows
                </h3>
                <p className="text-clones-text-tertiary mb-4 text-sm leading-relaxed">
                  Complete frontend development tasks including React components, CSS styling, and responsive design patterns.
                </p>
                
                {/* Use Case Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-clones-accent-primary/20 text-clones-accent-primary px-2 py-1 rounded text-xs border border-clones-accent-primary/30">
                    Frontend
                  </span>
                  <span className="bg-clones-accent-secondary/20 text-clones-accent-secondary px-2 py-1 rounded text-xs border border-clones-accent-secondary/30">
                    React
                  </span>
                  <span className="bg-clones-accent-tertiary/20 text-clones-accent-tertiary px-2 py-1 rounded text-xs border border-clones-accent-tertiary/30">
                    CSS
                  </span>
                </div>
                
                {/* Dataset Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="text-center bg-clones-panel-elevated/50 rounded-lg p-3">
                    <div className="text-clones-text-primary font-bold">1,250</div>
                    <div className="text-clones-text-muted">Samples</div>
                  </div>
                  <div className="text-center bg-clones-panel-elevated/50 rounded-lg p-3">
                    <div className="text-clones-text-primary font-bold">45h</div>
                    <div className="text-clones-text-muted">Duration</div>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-clones-accent-secondary to-clones-accent-primary hover:from-clones-accent-secondary/80 hover:to-clones-accent-primary/80 text-white py-3 rounded-lg transition-all duration-300 font-medium">
                  Purchase Dataset
                </button>
              </div>
            </div>

            {/* Dataset Card 2 */}
            <div className="group relative bg-gradient-to-br from-clones-panel-main/60 to-clones-panel-secondary/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-clones-accent-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(139,92,246,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                    Quality: 8.8/10
                  </div>
                  <div className="text-clones-accent-primary font-mono text-2xl font-bold">
                    $1,800
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-clones-text-primary mb-3">
                  Data Analysis Tasks
                </h3>
                <p className="text-clones-text-tertiary mb-4 text-sm leading-relaxed">
                  Excel spreadsheet manipulation, data visualization, and statistical analysis workflows for business intelligence.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-clones-accent-primary/20 text-clones-accent-primary px-2 py-1 rounded text-xs border border-clones-accent-primary/30">
                    Excel
                  </span>
                  <span className="bg-clones-accent-secondary/20 text-clones-accent-secondary px-2 py-1 rounded text-xs border border-clones-accent-secondary/30">
                    Analytics
                  </span>
                  <span className="bg-clones-accent-tertiary/20 text-clones-accent-tertiary px-2 py-1 rounded text-xs border border-clones-accent-tertiary/30">
                    BI
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="text-center bg-clones-panel-elevated/50 rounded-lg p-3">
                    <div className="text-clones-text-primary font-bold">890</div>
                    <div className="text-clones-text-muted">Samples</div>
                  </div>
                  <div className="text-center bg-clones-panel-elevated/50 rounded-lg p-3">
                    <div className="text-clones-text-primary font-bold">32h</div>
                    <div className="text-clones-text-muted">Duration</div>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-clones-accent-primary to-clones-accent-secondary hover:from-clones-accent-primary/80 hover:to-clones-accent-secondary/80 text-white py-3 rounded-lg transition-all duration-300 font-medium">
                  Purchase Dataset
                </button>
              </div>
            </div>

            {/* Dataset Card 3 */}
            <div className="group relative bg-gradient-to-br from-clones-panel-main/60 to-clones-panel-secondary/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-clones-accent-tertiary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(236,72,153,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-tertiary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium border border-yellow-500/30">
                    Quality: 8.5/10
                  </div>
                  <div className="text-clones-accent-tertiary font-mono text-2xl font-bold">
                    $3,200
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-clones-text-primary mb-3">
                  Design & Creative Tools
                </h3>
                <p className="text-clones-text-tertiary mb-4 text-sm leading-relaxed">
                  Photoshop, Figma, and Illustrator workflows for UI/UX design, photo editing, and digital art creation.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-clones-accent-primary/20 text-clones-accent-primary px-2 py-1 rounded text-xs border border-clones-accent-primary/30">
                    Photoshop
                  </span>
                  <span className="bg-clones-accent-secondary/20 text-clones-accent-secondary px-2 py-1 rounded text-xs border border-clones-accent-secondary/30">
                    Figma
                  </span>
                  <span className="bg-clones-accent-tertiary/20 text-clones-accent-tertiary px-2 py-1 rounded text-xs border border-clones-accent-tertiary/30">
                    UI/UX
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="text-center bg-clones-panel-elevated/50 rounded-lg p-3">
                    <div className="text-clones-text-primary font-bold">2,100</div>
                    <div className="text-clones-text-muted">Samples</div>
                  </div>
                  <div className="text-center bg-clones-panel-elevated/50 rounded-lg p-3">
                    <div className="text-clones-text-primary font-bold">67h</div>
                    <div className="text-clones-text-muted">Duration</div>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-clones-accent-tertiary to-clones-accent-primary hover:from-clones-accent-tertiary/80 hover:to-clones-accent-primary/80 text-white py-3 rounded-lg transition-all duration-300 font-medium">
                  Purchase Dataset
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative flex justify-center py-8">
        <div className="relative">
          <div className="w-96 h-px bg-gradient-to-r from-transparent via-clones-accent-primary/40 to-transparent"></div>
          <div className="absolute inset-0 w-96 h-px bg-gradient-to-r from-transparent via-clones-accent-secondary/30 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Section 2: Sell Your Data */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-5xl font-light text-clones-text-primary mb-6 tracking-wide">
                Sell Your Data
              </h2>
              <p className="text-xl text-clones-text-tertiary mb-8 leading-relaxed">
                Monetize your Factories by selling high-quality datasets instantly.
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-clones-accent-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-clones-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-clones-text-primary mb-2">Instant Settlement</h3>
                    <p className="text-clones-text-tertiary">Get paid immediately when your dataset sells. No waiting periods or payment delays.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-clones-accent-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-clones-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-clones-text-primary mb-2">Quality Verification</h3>
                    <p className="text-clones-text-tertiary">Automated quality scoring ensures your datasets meet marketplace standards.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-clones-accent-tertiary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-clones-accent-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-clones-text-primary mb-2">Dynamic Pricing</h3>
                    <p className="text-clones-text-tertiary">AI-powered pricing optimization maximizes your revenue potential.</p>
                  </div>
                </div>
              </div>
              
              <button className="bg-gradient-to-r from-clones-accent-primary to-clones-accent-secondary hover:from-clones-accent-primary/80 hover:to-clones-accent-secondary/80 text-white px-8 py-4 rounded-lg transition-all duration-300 font-medium text-lg shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:-translate-y-1">
                Start Selling
              </button>
            </div>
            
            {/* Right Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-primary/10 via-transparent to-clones-accent-secondary/10"></div>
                <div className="relative">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-4">💰</div>
                    <h3 className="text-2xl font-medium text-clones-text-primary mb-2">Revenue Potential</h3>
                    <p className="text-clones-text-tertiary">Based on current marketplace data</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-clones-panel-elevated/50 rounded-lg">
                      <span className="text-clones-text-secondary">High-Quality Dataset</span>
                      <span className="text-clones-accent-primary font-bold">$2,000-5,000</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-clones-panel-elevated/50 rounded-lg">
                      <span className="text-clones-text-secondary">Medium Dataset</span>
                      <span className="text-clones-accent-secondary font-bold">$800-2,000</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-clones-panel-elevated/50 rounded-lg">
                      <span className="text-clones-text-secondary">Specialized Niche</span>
                      <span className="text-clones-accent-tertiary font-bold">$3,000-8,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative flex justify-center py-8">
        <div className="relative">
          <div className="w-96 h-px bg-gradient-to-r from-transparent via-clones-accent-secondary/40 to-transparent"></div>
          <div className="absolute inset-0 w-96 h-px bg-gradient-to-r from-transparent via-clones-accent-tertiary/30 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Section 3: Why it's different */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-clones-text-primary mb-6 tracking-wide">Why It's Different</h2>
            <p className="text-xl text-clones-text-tertiary max-w-3xl mx-auto">
              Traditional data vendors vs. the future of dataset exchange
            </p>
          </div>

          {/* Comparison Block */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Web2 Vendors */}
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/20 rounded-2xl p-8 relative">
              <div className="absolute top-4 right-4">
                <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                  Web2 Vendors
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-medium text-clones-text-primary mb-4">Scale AI / Appen</h3>
                <p className="text-clones-text-tertiary mb-6">Traditional data labeling platforms</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-red-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>Gatekeepers control access</span>
                </div>
                <div className="flex items-center gap-3 text-red-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>Bulk purchases only</span>
                </div>
                <div className="flex items-center gap-3 text-red-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>Slow payment cycles</span>
                </div>
                <div className="flex items-center gap-3 text-red-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>Opaque pricing</span>
                </div>
                <div className="flex items-center gap-3 text-red-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>Limited data types</span>
                </div>
                <div className="flex items-center gap-3 text-red-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>High platform fees</span>
                </div>
              </div>
            </div>

            {/* CLONES Marketplace */}
            <div className="bg-gradient-to-br from-clones-accent-primary/20 to-clones-accent-secondary/10 border border-clones-accent-primary/30 rounded-2xl p-8 relative">
              <div className="absolute top-4 right-4">
                <div className="bg-clones-accent-primary/20 text-clones-accent-primary px-3 py-1 rounded-full text-sm font-medium">
                  CLONES Marketplace
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-medium text-clones-text-primary mb-4">On-Chain Exchange</h3>
                <p className="text-clones-text-tertiary mb-6">Decentralized dataset marketplace</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-green-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>No gatekeepers - direct access</span>
                </div>
                <div className="flex items-center gap-3 text-green-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Atomic data buying</span>
                </div>
                <div className="flex items-center gap-3 text-green-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Instant settlement</span>
                </div>
                <div className="flex items-center gap-3 text-green-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Transparent pricing</span>
                </div>
                <div className="flex items-center gap-3 text-green-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Any computer interaction</span>
                </div>
                <div className="flex items-center gap-3 text-green-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Minimal fees (2-3%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light text-clones-text-primary mb-6 tracking-wide">
            Ready to Transform Data Exchange?
          </h2>
          <p className="text-xl text-clones-text-tertiary mb-12 max-w-2xl mx-auto">
            Join the first decentralized marketplace for computer interaction datasets
          </p>
          
          <button className="group inline-flex items-center gap-4 px-12 py-5 bg-gradient-to-r from-clones-accent-primary via-clones-accent-secondary to-clones-accent-tertiary hover:from-clones-accent-primary/80 hover:via-clones-accent-secondary/80 hover:to-clones-accent-tertiary/80 text-white rounded-xl transition-all duration-300 font-medium text-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-clones-accent-primary via-clones-accent-secondary to-clones-accent-tertiary opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-glow-pulse"></div>
            <span className="relative">Explore Early Access</span>
            <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
          
          <p className="text-sm text-clones-text-muted mt-6">
            Early access includes exclusive pricing and priority support
          </p>
        </div>
      </section>
    </div>
  );
}