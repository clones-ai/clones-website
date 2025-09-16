import { RevealUp } from '../components/motion/Reveal';
import Footer from '../components/Footer';
import { SimpleSpline } from '../components/shared/SimpleSpline';



export default function SoonPage() {

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="relative flex-grow">
        {/* Ultra-black background layer */}
        <div className="absolute inset-0 z-0" style={{ backgroundColor: '#000000' }}></div>

        {/* 3D Background Spline */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pt-40">
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
                      opacity: 0,
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


        {/* Background Video Loop - Replaces 3D Animation */}
        {/* <div className="absolute inset-0 z-10 flex items-center justify-center">
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
        </div> */}

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

      <Footer platformLinksMode="soon" isHomePage={true} />
    </div >
  );
}