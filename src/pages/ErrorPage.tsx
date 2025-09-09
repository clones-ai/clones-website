import { RevealUp } from '../components/motion/Reveal';
import { AnimatedButton } from '../components/motion/AnimatedButton';
import { UnifiedSpline } from '../components/shared/UnifiedSpline';

interface ErrorPageProps {
  errorCode?: string;
  errorMessage?: string;
}

export default function ErrorPage({
  errorCode = "404",
  errorMessage = "Page not found"
}: ErrorPageProps) {

  return (
    <div className="min-h-screen overflow-hidden -mt-20 bg-black">
      <div className="relative h-screen">
        {/* Ultra-black background layer */}
        <div className="absolute inset-0 z-0" style={{ backgroundColor: '#000000' }}></div>

        {/* Background Animation */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative">
            <div
              className="relative z-0"
              style={{
                width: '100vw',
                height: '100vh',
                maxWidth: '800px',
                maxHeight: '800px',
                minWidth: '300px',
                minHeight: '300px'
              }}
            >
              <div className="absolute inset-0" style={{ backgroundColor: '#000000' }}></div>
              <div
                className="relative z-10 w-full h-full"
                style={{ opacity: '0.3', filter: 'brightness(0.8) contrast(1.2)' }}
              >
                <UnifiedSpline
                  url="/liquid-ring.splinecode"
                  className="w-full h-full"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
          <RevealUp distance={4}>
            <div className="mb-8">
              <div className="text-6xl md:text-8xl font-bold text-red-500 mb-4">
                {errorCode}
              </div>
              <h1 className="text-2xl md:text-4xl font-light text-text-primary mb-6">
                {errorMessage}
              </h1>
              <p className="text-text-secondary text-lg max-w-md mx-auto mb-8">
                {errorCode === "404"
                  ? "The page you are looking for seems to have disappeared into the universe of clones."
                  : "Something went wrong. Our clones are working to resolve the issue."
                }
              </p>
            </div>
          </RevealUp>

          <RevealUp distance={4} delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4">

              <AnimatedButton variant="primary"
                size="lg"
                onClick={() => window.location.href = '/'}
                className="font-sans">
                Back to Home
              </AnimatedButton>


              <AnimatedButton variant="secondary"
                size="lg"
                onClick={() => window.history.back()}
                className="font-sans">
                Previous Page
              </AnimatedButton>

            </div>
          </RevealUp>

        </div>
      </div>
    </div>
  );
}