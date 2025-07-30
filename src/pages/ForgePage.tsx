import React from 'react';

export default function ForgePage() {
  // Slideshow functionality
  let currentSlideIndex = 0;
  const totalSlides = 4;
  
  const slideData = [
    { 
      title: 'Task Recording Interface', 
      description: 'Advanced recording system that captures every interaction for AI training.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
      features: [
        { icon: '⚡', label: 'Real-time Analysis' },
        { icon: '🎯', label: 'Quality Scoring' },
        { icon: '💰', label: 'Instant Rewards' }
      ]
    },
    { 
      title: 'Factory Exploration Page', 
      description: 'Browse and discover AI training environments that match your skills.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      features: [
        { icon: '🏭', label: 'Factory Browser' },
        { icon: '📊', label: 'Skill Matching' },
        { icon: '🔍', label: 'Task Discovery' }
      ]
    },
    { 
      title: 'Reward Tracking Dashboard', 
      description: 'Real-time dashboard for tracking earnings and performance metrics.',
      image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=500&fit=crop',
      features: [
        { icon: '📈', label: 'Performance Analytics' },
        { icon: '💎', label: 'Quality Metrics' },
        { icon: '🎯', label: 'Goal Tracking' }
      ]
    },
    { 
      title: 'Referral Revenue Dashboard', 
      description: 'Monitor referral performance and passive income from your network.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop',
      features: [
        { icon: '👥', label: 'Network Growth' },
        { icon: '💰', label: 'Commission Tracking' },
        { icon: '📊', label: 'Performance Insights' }
      ]
    }
  ];

  const updateSlideshow = (newIndex: number) => {
    const dots = document.querySelectorAll('.slide-dot');
    dots.forEach(dot => dot.classList.remove('active'));
    dots[newIndex]?.classList.add('active');
    
    const currentData = slideData[newIndex];
    const imageEl = document.getElementById('current-slide-image') as HTMLImageElement;
    const titleEl = document.getElementById('slideshow-title');
    const descEl = document.getElementById('slideshow-description');
    const featuresEl = document.getElementById('slide-features');
    
    if (imageEl) {
      imageEl.src = currentData.image;
      imageEl.alt = currentData.title;
    }
    if (titleEl) titleEl.textContent = currentData.title;
    if (descEl) descEl.textContent = currentData.description;
    if (featuresEl) {
      featuresEl.innerHTML = currentData.features.map(feature => `
        <div class="text-center">
          <div class="text-clones-accent-primary text-2xl mb-2">${feature.icon}</div>
          <div class="text-sm text-clones-text-secondary">${feature.label}</div>
        </div>
      `).join('');
    }
    
    currentSlideIndex = newIndex;
  };

  const nextSlide = () => {
    const nextIndex = (currentSlideIndex + 1) % totalSlides;
    updateSlideshow(nextIndex);
  };

  const previousSlide = () => {
    const prevIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
    updateSlideshow(prevIndex);
  };

  React.useEffect(() => {
    // Initialize slideshow
    updateSlideshow(0);

    // Add event listeners for dots
    const dots = document.querySelectorAll('.slide-dot');
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => updateSlideshow(index));
    });

    // Add event listeners for role tabs
    const roleTabs = document.querySelectorAll('.role-tab');
    const roleContents = document.querySelectorAll('.role-content');

    roleTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const targetRole = (this as HTMLElement).dataset.role;
        
        // Update active tab
        roleTabs.forEach(t => {
          t.classList.remove('active', 'text-clones-accent-primary', 'bg-gradient-to-br', 'from-clones-panel-main', 'to-clones-panel-elevated', 'border-clones-accent-primary/30');
          t.classList.add('text-clones-text-tertiary');
          (t as HTMLElement).style.boxShadow = '';
        });
        
        (this as HTMLElement).classList.add('active', 'text-clones-accent-primary', 'bg-gradient-to-br', 'from-clones-panel-main', 'to-clones-panel-elevated', 'border-clones-accent-primary/30');
        (this as HTMLElement).classList.remove('text-clones-text-tertiary');
        (this as HTMLElement).style.boxShadow = '0 4px 8px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)';
        
        // Update active content
        roleContents.forEach(content => {
          content.classList.remove('active', 'animate-slide-in');
        });
        
        const targetContent = document.querySelector(`.role-content[data-role="${targetRole}"]`);
        targetContent?.classList.add('active', 'animate-slide-in');
      });
    });

    // Make navigation functions global
    (window as any).nextSlide = nextSlide;
    (window as any).previousSlide = previousSlide;
  }, []);

  return (
    <div className="bg-clones-bg-primary text-clones-text-primary min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-clones-accent-primary/5 to-transparent"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-clones-accent-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-clones-accent-tertiary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-light text-clones-text-primary tracking-wide mb-8 leading-tight">
            Teach AI How to Use a Computer<br />
            <span className="text-clones-accent-primary">and Get Paid</span>
          </h1>
          <p className="text-xl text-clones-text-tertiary max-w-4xl mx-auto leading-relaxed mb-4">
            Record your computer skills, contribute to AI training datasets, and earn crypto rewards based on quality.
          </p>
          
          {/* Simplified Elegant Slideshow */}
          <div className="relative mb-12">
            <div className="max-w-5xl mx-auto">
              
              {/* Single Dominant Image */}
              <div className="relative group">
                <div className="relative overflow-hidden rounded-2xl border border-white/10">
                  <img id="current-slide-image" 
                       src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop" 
                       alt="Task Recording Interface" 
                       className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" />
                  
                  {/* Overlay with gradient for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Elegant Navigation Arrows */}
                  <button className="nav-arrow nav-arrow-left absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300" onClick={previousSlide}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  
                  <button className="nav-arrow nav-arrow-right absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300" onClick={nextSlide}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Enhanced Descriptive Content */}
              <div className="text-center mt-8 mb-8">
                <div className="max-w-4xl mx-auto">
                  <h3 id="slideshow-title" className="text-3xl font-medium text-clones-text-primary mb-6">
                    Task Recording Interface
                  </h3>
                  <p id="slideshow-description" className="text-lg text-clones-text-tertiary mb-8">
                    Advanced recording system that captures every interaction for AI training.
                  </p>
                </div>
              </div>

              {/* Enhanced Navigation Dots */}
              <div className="flex justify-center items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <button className="slide-dot active" data-slide="0"></button>
                  <button className="slide-dot" data-slide="1"></button>
                  <button className="slide-dot" data-slide="2"></button>
                  <button className="slide-dot" data-slide="3"></button>
                </div>
              </div>

              {/* Prominent CTA */}
              <div className="text-center">
                <button className="group inline-flex items-center gap-4 px-12 py-5 bg-gradient-to-r from-clones-accent-primary to-clones-accent-secondary hover:from-clones-accent-primary/80 hover:to-clones-accent-secondary/80 text-white rounded-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:-translate-y-2 font-medium text-xl">
                  <span>Launch Forge App</span>
                  <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative flex justify-center py-1">
        <div className="relative">
          <div className="w-96 h-px bg-gradient-to-r from-transparent via-clones-accent-primary/40 to-transparent"></div>
          <div className="absolute inset-0 w-96 h-px bg-gradient-to-r from-transparent via-clones-accent-secondary/30 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Enhanced Neomorphic Role Selection */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-clones-text-primary mb-4 tracking-wide">Choose Your Path</h2>
          </div>

          {/* Enhanced Neomorphic Container */}
          <div className="relative bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary rounded-3xl p-1 border border-white/10" style={{boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'}}>
            <div className="bg-gradient-to-br from-clones-panel-main via-clones-panel-secondary to-clones-panel-main rounded-3xl p-8" style={{boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3), inset 0 -2px 8px rgba(255,255,255,0.05)'}}>
              
              {/* Enhanced Role Tabs */}
              <div className="flex justify-center mb-8">
                <div className="flex bg-gradient-to-r from-clones-panel-elevated to-clones-panel-secondary rounded-2xl p-2 border border-white/10" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'}}>
                  <button className="role-tab active px-8 py-4 rounded-xl text-sm font-medium transition-all duration-300 text-clones-accent-primary bg-gradient-to-br from-clones-panel-main to-clones-panel-elevated border border-clones-accent-primary/30" data-role="farmer" style={{boxShadow: '0 4px 8px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'}}>
                    🧑‍🌾 FARMER
                  </button>
                  <button className="role-tab px-8 py-4 rounded-xl text-sm font-medium transition-all duration-300 text-clones-text-tertiary hover:text-clones-text-secondary hover:bg-clones-panel-elevated/50" data-role="factory">
                    🏭 FACTORY CREATOR
                  </button>
                  <button className="role-tab px-8 py-4 rounded-xl text-sm font-medium transition-all duration-300 text-clones-text-tertiary hover:text-clones-text-secondary hover:bg-clones-panel-elevated/50" data-role="ambassador">
                    👥 AMBASSADOR
                  </button>
                </div>
              </div>

              {/* Enhanced Role Content */}
              <div className="role-content-container min-h-[500px] bg-gradient-to-br from-clones-panel-elevated/50 to-clones-panel-secondary/50 rounded-2xl p-8 border border-white/5" style={{boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)'}}>
                
                {/* Farmer Content */}
                <div className="role-content active animate-slide-in" data-role="farmer">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4 animate-float">🧑‍🌾</div>
                    <h3 className="text-3xl font-medium text-clones-text-primary mb-4 bg-gradient-to-r from-clones-accent-primary to-clones-accent-secondary bg-clip-text text-transparent">Record & Earn</h3>
                    <p className="text-clones-text-tertiary max-w-2xl mx-auto text-lg leading-relaxed">Turn your daily computer tasks into income. Record demonstrations of workflows you already know and get paid instantly based on quality scores.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4 max-w-md mx-auto">
                      <div className="flex items-center gap-3 text-clones-text-secondary p-3 bg-clones-panel-main/50 rounded-lg border border-white/5">
                        <span className="text-green-400 text-xl">✅</span>
                        <span className="font-medium">Start earning in minutes</span>
                      </div>
                      <div className="flex items-center gap-3 text-clones-text-secondary p-3 bg-clones-panel-main/50 rounded-lg border border-white/5">
                        <span className="text-green-400 text-xl">✅</span>
                        <span className="font-medium">Work from anywhere, anytime</span>
                      </div>
                      <div className="flex items-center gap-3 text-clones-text-secondary p-3 bg-clones-panel-main/50 rounded-lg border border-white/5">
                        <span className="text-green-400 text-xl">✅</span>
                        <span className="font-medium">Higher quality = higher rewards</span>
                      </div>
                      <div className="flex items-center gap-3 text-clones-text-secondary p-3 bg-clones-panel-main/50 rounded-lg border border-white/5">
                        <span className="text-green-400 text-xl">✅</span>
                        <span className="font-medium">Build reputation for premium tasks</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <button className="bg-gradient-to-r from-clones-accent-primary to-clones-accent-secondary hover:from-clones-accent-primary/80 hover:to-clones-accent-secondary/80 text-white px-8 py-4 rounded-lg transition-all duration-300 font-medium text-lg shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:-translate-y-1">
                      Start Recording Tasks
                    </button>
                  </div>
                </div>

                {/* Factory Creator Content */}
                <div className="role-content" data-role="factory">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4 animate-float">🏭</div>
                    <h3 className="text-3xl font-medium text-clones-text-primary mb-4 bg-gradient-to-r from-clones-accent-secondary to-clones-accent-tertiary bg-clip-text text-transparent">Fund & Monetize</h3>
                    <p className="text-clones-text-tertiary max-w-2xl mx-auto text-lg leading-relaxed">Create training environments for your specific workflows. Fund reward pools to collect demonstrations, then sell datasets or train your own AI agents.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4 max-w-md mx-auto">
                      <div className="flex items-center gap-3 text-clones-text-secondary p-3 bg-clones-panel-main/50 rounded-lg border border-white/5">
                        <span className="text-green-400 text-xl">✅</span>
                        <span className="font-medium">Turn workflows into revenue streams</span>
                      </div>
                      <div className="flex items-center gap-3 text-clones-text-secondary p-3 bg-clones-panel-main/50 rounded-lg border border-white/5">
                        <span className="text-green-400 text-xl">✅</span>
                        <span className="font-medium">Access global talent pool</span>
                      </div>
                      <div className="flex items-center gap-3 text-clones-text-secondary p-3 bg-clones-panel-main/50 rounded-lg border border-white/5">
                        <span className="text-green-400 text-xl">✅</span>
                        <span className="font-medium">Control quality with reward tiers</span>
                      </div>
                      <div className="flex items-center gap-3 text-clones-text-secondary p-3 bg-clones-panel-main/50 rounded-lg border border-white/5">
                        <span className="text-green-400 text-xl">✅</span>
                        <span className="font-medium">Multiple monetization paths</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <button className="bg-gradient-to-r from-clones-accent-secondary to-clones-accent-tertiary hover:from-clones-accent-secondary/80 hover:to-clones-accent-tertiary/80 text-white px-8 py-4 rounded-lg transition-all duration-300 font-medium text-lg shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:-translate-y-1">
                      Launch Your Factory
                    </button>
                  </div>
                </div>

                {/* Ambassador Content */}
                <div className="role-content" data-role="ambassador">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4 animate-float">👥</div>
                    <h3 className="text-3xl font-medium text-clones-text-primary mb-4 bg-gradient-to-r from-clones-accent-tertiary to-clones-accent-primary bg-clip-text text-transparent">Refer & Profit</h3>
                    <p className="text-clones-text-tertiary max-w-2xl mx-auto text-lg">Track passive income from your network activity. Monitor referral performance, view commission breakdowns, and scale your earnings through strategic network building.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4 max-w-md mx-auto">
                      <div className="flex items-center gap-3 text-clones-text-secondary p-3 bg-clones-panel-main/50 rounded-lg border border-white/5">
                        <span className="text-green-400 text-xl">✅</span>
                        <span className="font-medium">Lifetime recurring commissions</span>
                      </div>
                      <div className="flex items-center gap-3 text-clones-text-secondary p-3 bg-clones-panel-main/50 rounded-lg border border-white/5">
                        <span className="text-green-400 text-xl">✅</span>
                        <span className="font-medium">No caps on earnings</span>
                      </div>
                      <div className="flex items-center gap-3 text-clones-text-secondary p-3 bg-clones-panel-main/50 rounded-lg border border-white/5">
                        <span className="text-green-400 text-xl">✅</span>
                        <span className="font-medium">Higher $CLONES holdings = higher rates</span>
                      </div>
                      <div className="flex items-center gap-3 text-clones-text-secondary p-3 bg-clones-panel-main/50 rounded-lg border border-white/5">
                        <span className="text-green-400 text-xl">✅</span>
                        <span className="font-medium">Transparent on-chain tracking</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <button className="bg-gradient-to-r from-clones-accent-tertiary to-clones-accent-primary hover:from-clones-accent-tertiary/80 hover:to-clones-accent-primary/80 text-white px-8 py-4 rounded-lg transition-all duration-300 font-medium text-lg shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] hover:-translate-y-1">
                      Get Referral Link
                    </button>
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
          <div className="w-96 h-px bg-gradient-to-r from-transparent via-clones-accent-primary/40 to-transparent"></div>
          <div className="absolute inset-0 w-96 h-px bg-gradient-to-r from-transparent via-clones-accent-secondary/30 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Enhanced On-Chain Referral Program */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-clones-accent-primary/10 via-clones-accent-secondary/10 to-clones-accent-tertiary/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary rounded-3xl p-12 border border-white/10" style={{boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'}}>
              <h2 className="text-6xl font-light mb-6 bg-gradient-to-r from-clones-accent-primary via-clones-accent-secondary to-clones-accent-tertiary bg-clip-text text-transparent">💰 Turn Your Network Into Passive Income</h2>
              <p className="text-2xl text-clones-text-tertiary font-light">Share a link. Earn crypto forever. No caps, no limits.</p>
            </div>
          </div>

          {/* Enhanced The Opportunity */}
          <div className="bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary border border-white/10 rounded-3xl p-8 mb-12 relative overflow-hidden" style={{boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-primary/5 via-transparent to-clones-accent-tertiary/5"></div>
            <div className="relative">
              <h3 className="text-3xl font-medium text-clones-text-primary mb-6 text-center bg-gradient-to-r from-clones-accent-primary to-clones-accent-secondary bg-clip-text text-transparent">The Opportunity</h3>
              <p className="text-2xl text-clones-text-secondary text-center mb-8 font-light italic">"Every person you refer becomes a recurring revenue stream."</p>
              
              <div className="text-center text-clones-text-tertiary mb-8 text-lg">When someone uses your referral link:</div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center bg-clones-panel-elevated/50 rounded-2xl p-6 border border-white/5" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'}}>
                  <div className="text-green-400 text-4xl mb-4">✅</div>
                  <div className="text-clones-text-secondary font-medium text-lg mb-2">They earn from their work</div>
                  <div className="text-clones-text-muted text-sm">(Farming, Factory Creation)</div>
                </div>
                <div className="text-center bg-clones-panel-elevated/50 rounded-2xl p-6 border border-white/5" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'}}>
                  <div className="text-green-400 text-4xl mb-4">✅</div>
                  <div className="text-clones-text-secondary font-medium text-lg mb-2">You earn from their success</div>
                  <div className="text-clones-text-muted text-sm">(1-5% of all their activity)</div>
                </div>
                <div className="text-center bg-clones-panel-elevated/50 rounded-2xl p-6 border border-white/5" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'}}>
                  <div className="text-green-400 text-4xl mb-4">✅</div>
                  <div className="text-clones-text-secondary font-medium text-lg mb-2">Forever</div>
                  <div className="text-clones-text-muted text-sm">(Lifetime commissions, not one-time)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced How It Works */}
          <div className="mb-12">
            <h3 className="text-3xl font-medium text-clones-text-primary mb-8 text-center bg-gradient-to-r from-clones-accent-secondary to-clones-accent-tertiary bg-clip-text text-transparent">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden" style={{boxShadow: '0 10px 30px rgba(0,0,0,0.2)'}}>
                <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-primary/10 to-transparent"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-clones-accent-primary to-clones-accent-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                    <span className="text-white font-bold text-2xl">1</span>
                  </div>
                  <h4 className="text-clones-text-primary font-medium mb-4 text-xl">Get Your Link</h4>
                  <p className="text-clones-text-tertiary">Connect wallet → Generate unique referral link (30 seconds)</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden" style={{boxShadow: '0 10px 30px rgba(0,0,0,0.2)'}}>
                <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-secondary/10 to-transparent"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-clones-accent-secondary to-clones-accent-tertiary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                    <span className="text-white font-bold text-2xl">2</span>
                  </div>
                  <h4 className="text-clones-text-primary font-medium mb-4 text-xl">Share & Forget</h4>
                  <p className="text-clones-text-tertiary">Share with freelancers, business owners, crypto enthusiasts</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden" style={{boxShadow: '0 10px 30px rgba(0,0,0,0.2)'}}>
                <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-tertiary/10 to-transparent"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-clones-accent-tertiary to-clones-accent-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                    <span className="text-white font-bold text-2xl">3</span>
                  </div>
                  <h4 className="text-clones-text-primary font-medium mb-4 text-xl">Earn Forever</h4>
                  <p className="text-clones-text-tertiary">Every task they complete = You get paid</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Commission Tier Table */}
          <div className="bg-gradient-to-br from-clones-panel-main to-clones-panel-secondary border border-white/10 rounded-3xl overflow-hidden relative" style={{boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-clones-accent-primary/5 via-transparent to-clones-accent-tertiary/5"></div>
            <div className="relative">
              <div className="bg-gradient-to-r from-clones-panel-secondary to-clones-panel-elevated px-8 py-6 border-b border-white/10">
                <h3 className="text-2xl font-medium text-center bg-gradient-to-r from-clones-accent-primary to-clones-accent-tertiary bg-clip-text text-transparent">Commission Tier Table</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-clones-panel-elevated to-clones-panel-secondary">
                    <tr>
                      <th className="px-8 py-6 text-left text-clones-text-secondary font-medium text-lg">Your $CLONES Holdings</th>
                      <th className="px-8 py-6 text-left text-clones-text-secondary font-medium text-lg">% of Supply</th>
                      <th className="px-8 py-6 text-left text-clones-text-secondary font-medium text-lg">Commission Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr className="hover:bg-clones-panel-elevated/30 transition-colors duration-300">
                      <td className="px-8 py-6 text-clones-text-primary font-mono text-lg">1M tokens</td>
                      <td className="px-8 py-6 text-clones-text-tertiary text-lg">0.1%</td>
                      <td className="px-8 py-6 text-clones-accent-primary font-bold text-xl">1%</td>
                    </tr>
                    <tr className="hover:bg-clones-panel-elevated/30 transition-colors duration-300">
                      <td className="px-8 py-6 text-clones-text-primary font-mono text-lg">2M tokens</td>
                      <td className="px-8 py-6 text-clones-text-tertiary text-lg">0.2%</td>
                      <td className="px-8 py-6 text-clones-accent-primary font-bold text-xl">2%</td>
                    </tr>
                    <tr className="hover:bg-clones-panel-elevated/30 transition-colors duration-300">
                      <td className="px-8 py-6 text-clones-text-primary font-mono text-lg">3M tokens</td>
                      <td className="px-8 py-6 text-clones-text-tertiary text-lg">0.3%</td>
                      <td className="px-8 py-6 text-clones-accent-primary font-bold text-xl">3%</td>
                    </tr>
                    <tr className="hover:bg-clones-panel-elevated/30 transition-colors duration-300">
                      <td className="px-8 py-6 text-clones-text-primary font-mono text-lg">4M tokens</td>
                      <td className="px-8 py-6 text-clones-text-tertiary text-lg">0.4%</td>
                      <td className="px-8 py-6 text-clones-accent-primary font-bold text-xl">4%</td>
                    </tr>
                    <tr className="hover:bg-clones-panel-elevated/30 transition-colors duration-300">
                      <td className="px-8 py-6 text-clones-text-primary font-mono text-lg">5M tokens</td>
                      <td className="px-8 py-6 text-clones-text-tertiary text-lg">0.5%</td>
                      <td className="px-8 py-6 text-clones-accent-primary font-bold text-xl">5%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Elegant Navigation Arrows */
        .nav-arrow {
          width: 60px;
          height: 60px;
          background: rgba(26, 26, 26, 0.95);
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-radius: 50%;
          color: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(20px);
        }

        .nav-arrow:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.8);
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
          transform: scale(1.1);
        }
        
        /* Enhanced Control Dots */
        .slide-dot {
          position: relative;
          padding: 8px 16px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .slide-dot.active {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
        }
        
        .role-content {
          display: none;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }
        
        .role-content.active {
          display: block;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}