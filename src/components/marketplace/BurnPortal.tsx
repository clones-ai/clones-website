import { RevealUp } from '../motion/Reveal';
import { TiltCard } from '../motion/TiltCard';

export function BurnPortal() {

  return (
    <section className="min-h-screen flex flex-col justify-center pt-4 pb-24 px-4 sm:px-6 relative overflow-hidden">

      {/* Background Image - Hidden on mobile, visible on desktop */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block" style={{ backgroundImage: 'url(/portal-burn-bg.webp)' }}></div>

      <div className="max-w-6xl mx-auto">
        <RevealUp distance={10}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-text-primary mb-16 tracking-wide text-center font-system relative z-10 burning-text">
            The Burn Portal
          </h2>
        </RevealUp>

        {/* Centered Flow */}
        <div className="max-w-2xl mx-auto relative z-10">
          <RevealUp distance={8}>
            <div className="text-center mb-12">
              <p className="text-lg sm:text-xl text-text-secondary leading-relaxed font-system">
                Convert tokens into dataset access rights. <br />
                Burn the required threshold for data download. <br />
                The burn itself is the license & on-chain proof of access.
              </p>
            </div>
          </RevealUp>

          {/* Steps Layout - Grid with TiltCards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Step 1 */}
            <TiltCard className="ultra-premium-glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-ultra-premium-hover">
              <RevealUp distance={8}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-500/30">
                    <span className="text-primary-500 font-bold text-lg font-system">1</span>
                  </div>
                  <h4 className="text-lg font-medium text-text-primary mb-2 font-system">Connect wallet</h4>
                  <p className="text-text-secondary text-sm font-system">Holdings verified</p>
                </div>
              </RevealUp>
            </TiltCard>

            {/* Step 2 */}
            <TiltCard className="ultra-premium-glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-ultra-premium-hover">
              <RevealUp distance={8}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-600/30">
                    <span className="text-primary-600 font-bold text-lg font-system">2</span>
                  </div>
                  <h4 className="text-lg font-medium text-text-primary mb-2 font-system">Select dataset</h4>
                  <p className="text-text-secondary text-sm font-system">Confirm burn threshold</p>
                </div>
              </RevealUp>
            </TiltCard>

            {/* Step 3 */}
            <TiltCard className="ultra-premium-glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-ultra-premium-hover">
              <RevealUp distance={8}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-700/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-700/30">
                    <span className="text-primary-700 font-bold text-lg font-system">3</span>
                  </div>
                  <h4 className="text-lg font-medium text-text-primary mb-2 font-system">Execute Burn</h4>
                  <p className="text-text-secondary text-sm font-system">Irreversible</p>
                </div>
              </RevealUp>
            </TiltCard>

            {/* Step 4 */}
            <TiltCard className="ultra-premium-glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-ultra-premium-hover">
              <RevealUp distance={8}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <span className="text-green-400 font-bold text-lg font-system">4</span>
                  </div>
                  <h4 className="text-lg font-medium text-text-primary mb-2 font-system">Download access</h4>
                  <p className="text-text-secondary text-sm font-system">Proof recorded on-chain</p>
                </div>
              </RevealUp>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}