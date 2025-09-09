import { RevealUp } from '../motion/Reveal';
import { AnimatedButton } from '../motion/AnimatedButton';
import { UnifiedSpline } from '../shared/UnifiedSpline';

export function MarketplaceHero() {
  return (
    <section className="min-h-[110vh] flex flex-col justify-center relative pt-12 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Background Animation - Full Screen */}
      <div className="absolute inset-0 z-0">
        <UnifiedSpline
          url="/data-transfer.splinecode"
          className="absolute inset-0"
          style={{
            opacity: '0.3',
            minHeight: '110vh',
            height: '110vh',
            transform: 'scaleY(1.2)',
            transformOrigin: 'center center'
          }}
          loading="lazy"
        />

        {/* Bottom fade-out gradient for smooth transition */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(12, 5, 21, 0.3) 25%, rgba(6, 2, 8, 0.6) 50%, rgba(16, 8, 25, 0.8) 75%, rgba(12, 5, 21, 1) 100%)'
          }}
        ></div>
      </div>


      <div className="relative max-w-4xl mx-auto text-center flex-1 flex flex-col justify-center z-10">
        <RevealUp distance={8}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-text-primary tracking-wide mb-8 leading-tight font-system">
            On-Chain Exchange for Tokenized AI Training Data
          </h1>
        </RevealUp>

        {/* Epic Thesis Section */}
        <div className="max-w-6xl mx-auto text-center">
          {/* Our Difference */}
          <div className="max-w-4xl mx-auto space-y-6 text-lg sm:text-xl text-text-secondary leading-relaxed font-system mb-12">
            <RevealUp distance={6}>
              <p>
                Each dataset token maps to <span className="text-primary-500 font-medium">verifiable training data</span> valuable to train computer-use agents.
              </p>
            </RevealUp>
            <RevealUp distance={6}>
              <p>
                You <span className="text-primary-500 font-medium">invest</span> in the data that <span className="text-primary-500 font-medium">powers</span> AI automation.
              </p>
            </RevealUp>
            <RevealUp distance={6}>
              <p>
                After bonding curve graduation, holders can burn supply to download data through <span className="text-primary-500 font-medium">proof of access</span>.
              </p>
            </RevealUp>
          </div>

          {/* CTA Button */}
          <RevealUp distance={6}>
            <div className="p-4">
              <a
                href="https://clones.gitbook.io/clones.docs/the-forge/data-marketplace"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AnimatedButton variant="primary" size="lg" className="font-sans">
                  Explore Marketplace
                </AnimatedButton>
              </a>
            </div>
          </RevealUp>
        </div>
      </div>
    </section>
  );
}