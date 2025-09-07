import { useState } from 'react';
import { XIcon } from 'lucide-react';
import { RevealUp } from '../components/motion/Reveal';
import { AnimatedButton } from '../components/motion/AnimatedButton';
import { UnifiedSpline } from '../components/shared/UnifiedSpline';

export default function HomePage() {
  const [showVideoPopup, setShowVideoPopup] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden -mt-20">
      <div className="relative h-screen">
        {/* Ultra-black background layer */}
        <div className="absolute inset-0 z-0" style={{ backgroundColor: '#000000' }}></div>

        {/* 3D Background Animation - Optimisé */}
        {/* <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 z-0" style={{ backgroundColor: '#000000' }}></div>
          <div className="relative z-10" style={{ opacity: '1', filter: 'brightness(1) contrast(1.5)' }}>
            <UnifiedSpline
              url="https://prod.spline.design/BknCtcxqfZULt3ch/scene.splinecode"
              className="w-full h-full"
              loading="eager"
              fallbackGradient="bg-black"
            />
          </div>
        </div> */}

        {/* Background Video Loop - Replaces 3D Animation */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <video
            className="w-4/5 sm:w-4/5 md:w-1/2 h-auto object-contain"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/Clones_home.webm" type="video/webm" />
            <source src="/Clones_home.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center will-change-transform z-20 px-4">
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


      <div className="flex flex-col items-center justify-center px-4 sm:px-6 text-center mt-12 sm:mt-20 mb-16 sm:mb-32">
        <RevealUp distance={4}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-text-primary mb-4 sm:mb-6 md:mb-8 tracking-tight sm:tracking-wide text-center leading-tight max-w-4xl mx-auto">
            Create a million versions of yourself
          </h2>
        </RevealUp>

        <RevealUp distance={3}>
          <p className="text-lg sm:text-xl md:text-2xl text-text-muted max-w-4xl mx-auto leading-relaxed mb-8 md:mb-12 text-center font-light">
            The First Liquid AI Data Infrastructure
          </p>
        </RevealUp>

        <RevealUp distance={2}>
          <div className="flex justify-center p-4">
            <AnimatedButton
              onClick={() => setShowVideoPopup(true)}
              variant="primary"
              size="lg"
              className="font-sans"
            >
              Meet Your Clone
            </AnimatedButton>
          </div>
        </RevealUp>
      </div>

      {/* Video Popup */}
      {
        showVideoPopup && (
          <div
            className="fixed z-150"
            style={{
              top: '75vh',
              left: 0,
              width: '100vw',
              height: '100vh'
            }}
            onClick={() => setShowVideoPopup(false)}
          >
            {/* Video Container - True center */}
            <div
              className="absolute bg-primary-900/40 backdrop-blur-xl rounded-xl md:rounded-2xl border border-primary-500/30 w-[90vw] sm:w-[80vw] md:w-full md:max-w-6xl"
              style={{
                top: '50vh',
                left: '50vw',
                transform: 'translate(-50%, -50%)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowVideoPopup(false)}
                className="absolute top-4 right-4 z-30 p-2 text-text-secondary hover:text-primary-500 hover:bg-black/50 rounded-lg transition-all duration-100"
              >
                <XIcon className="w-6 h-6" />
              </button>

              {/* Video Content - Full Container */}
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
        )
      }
    </div >
  );
}