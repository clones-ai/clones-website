import { RevealUp } from '../components/motion/Reveal';

export default function SoonPage() {

  return (
    <div className="min-h-screen overflow-hidden -mt-20 bg-black">
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
              Soon
            </p>
          </RevealUp>
        </div>
      </div>

    </div >
  );
}