import { useState } from 'react';
import { XIcon } from 'lucide-react';
import { RevealUp } from '../components/motion/Reveal';
import { AnimatedButton } from '../components/motion/AnimatedButton';
import { TiltCard } from '../components/motion/TiltCard';
import { SimpleSpline } from '../components/shared/SimpleSpline';

export default function HomePage() {
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden -mt-20 bg-black">
      <div className="relative h-[80vh] sm:h-[85vh]">
        <div className="absolute inset-0 z-0" style={{ backgroundColor: '#000000' }}></div>

        <div className="absolute inset-0 z-10 flex items-center justify-center pt-40 sm:pt-40" style={{ paddingTop: window.innerWidth < 768 ? '50px' : '160px' }}>
          <div className="relative">
            <div
              className="
                relative z-20
                w-[80vw] aspect-square
                sm:w-[100vw] sm:h-[80vh] sm:aspect-auto
                sm:max-w-[800px] sm:max-h-[800px]
                sm:min-w-[300px] sm:min-h-[300px]
              "
            >
              <div className="relative z-30 w-full h-full">
                {/* Mobile: Video fallback */}
                <div className="block sm:hidden w-full h-full">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      opacity: 1,
                      backgroundColor: 'transparent'
                    }}
                  >
                    <source src="/brain.webm" type="video/webm" />
                    <source src="/brain.mp4" type="video/mp4" />
                  </video>
                </div>

                {/* Desktop: Spline 3D */}
                <div className="hidden sm:block w-full h-full">
                  <SimpleSpline
                    url="/brain.splinecode"
                    className="w-full h-full"
                    style={{
                      filter: ' opacity(0.8)',
                      backgroundColor: 'transparent'
                    }}
                    loading="eager"
                    enableInteraction={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center justify-center text-center pointer-events-auto">
            <RevealUp distance={4}>
              <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-[60px] font-light text-text-primary tracking-[1px] sm:tracking-[2px] md:tracking-[3px] select-none leading-tight py-2">
                CLONES
              </h1>
            </RevealUp>
            <RevealUp distance={3}>
              <p className="text-xs sm:text-base md:text-base text-text-muted mt-2 md:mt-4 select-none tracking-wide font-medium max-w-sm">
                Create. Own. Trade.
              </p>
            </RevealUp>
          </div>
        </div>
      </div>

      <div
        className="w-full"
        style={{
          height: '20px',
          background: 'linear-gradient(to bottom, #000000 0%, transparent 100%)'
        }}
      ></div>

      <div className="flex flex-col items-center justify-center px-4 sm:px-6 text-center mt-2 sm:mt-4 mb-8 sm:mb-16 h-auto">
        <RevealUp distance={4}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-text-primary tracking-tight sm:tracking-wide text-center leading-tight sm:whitespace-nowrap">
            Create a million versions of yourself
          </h2>
        </RevealUp>

        <div className="flex-1 flex items-center justify-center my-4 md:my-6">
          <RevealUp distance={3}>
            <p className="text-lg sm:text-xl md:text-2xl text-text-muted max-w-4xl mx-auto leading-relaxed text-center font-light">
              The First Liquid AI Data Infrastructure
            </p>
          </RevealUp>
        </div>

        <RevealUp distance={2}>
          <div className="flex justify-center p-4">
            <AnimatedButton
              onClick={() => {
                setShowVideoPopup(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              variant="primary"
              size="lg"
              className="font-sans"
            >
              Meet Your Clone
            </AnimatedButton>
          </div>
        </RevealUp>

        <div className="mt-8 sm:mt-12 mb-8">
          <div className="max-w-2xl mx-auto">
            <TiltCard className="ultra-premium-glass-card rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-ultra-premium-hover">
              <RevealUp distance={4}>
                <h3 className="text-xl font-medium text-text-primary mb-6 font-system">CLONES Token</h3>
                <div className="bg-black/40 rounded-xl p-6 mb-6 border border-primary-500/20 group-hover:border-primary-500/40 group-hover:shadow-neon-primary transition-all duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-text-primary text-sm sm:text-base break-all leading-relaxed">
                      CA: 0xaadd98Ad4660008C917C6FE7286Bc54b2eEF894d
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('0xaadd98Ad4660008C917C6FE7286Bc54b2eEF894d');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex-shrink-0 p-2 hover:bg-primary-500/20 rounded-lg transition-colors duration-200 relative"
                      aria-label="Copy address"
                    >
                      {copied ? (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs text-green-400 whitespace-nowrap"></span>
                        </div>
                      ) : (
                        <svg className="w-4 h-4 text-text-primary hover:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <a
                  href="https://dexscreener.com/base/0xb5c8bb04a2cddf6798dae69955c63b41883ab5b4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-all duration-200 text-sm font-medium font-system group"
                >
                  View on DexScreener
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </RevealUp>
            </TiltCard>
          </div>
        </div>
      </div>

      {showVideoPopup && (
        <div
          className="fixed z-[99999]"
          style={{
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh'
          }}
          onClick={() => setShowVideoPopup(false)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>
          <div
            className="absolute bg-primary-900/40 backdrop-blur-xl rounded-xl md:rounded-2xl border border-primary-500/30 w-[90vw] sm:w-[80vw] md:w-full md:max-w-6xl z-10"
            style={{
              top: '50vh',
              left: '50vw',
              transform: 'translate(-50%, -50%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideoPopup(false)}
              className="absolute top-4 right-4 z-30 p-2 text-text-secondary hover:text-primary-500 hover:bg-black/50 rounded-lg transition-all duration-100"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <div className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden p-2 md:p-0">
              <video
                className="w-full h-full object-cover rounded-lg md:rounded-2xl"
                controls
                autoPlay
                poster="/Clones-meet-your-clone-poster.jpg"
              >
                <source src="/Clones-meet-your-clone.webm" type="video/webm" />
                <source src="/Clones-meet-your-clone.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
