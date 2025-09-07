import { RevealUp } from '../motion/Reveal';
import { ParallaxSection } from '../motion/ParallaxSection';

export function ForgeHero() {
  return (
    <section className="min-h-[70vh] sm:min-h-screen flex flex-col justify-center relative pt-8 sm:pt-12 pb-8 px-4 sm:px-6 overflow-hidden">

      <div className="relative max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center">
        <ParallaxSection speed={0.4} direction="up">
          <RevealUp distance={8}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-text-primary tracking-tight sm:tracking-wide mb-6 sm:mb-8 leading-tight font-sans">
              Turn Your Computer Skills Into<br className="hidden sm:block" />
              <span className="block sm:inline text-primary-500 font-sans">Tradeable AI Assets</span>
            </h1>
          </RevealUp>
        </ParallaxSection>
        <ParallaxSection speed={0.45} direction="up">
          <RevealUp distance={6}>
            <p className="text-lg sm:text-xl text-text-muted max-w-4xl mx-auto leading-relaxed mb-4 font-sans">
              The Forge is where human expertise becomes liquid IP.
            </p>
          </RevealUp>
        </ParallaxSection>
        <ParallaxSection speed={0.47} direction="up">
          <RevealUp distance={4}>
            <p className="text-base sm:text-lg text-text-subtle max-w-3xl mx-auto leading-relaxed mb-8 font-mono-jetbrains">
              <span className="font-bold text-primary-500">Record</span> → <span className="font-bold text-primary-600">Tokenize</span> → <span className="font-bold text-primary-700">Trade</span> → <span className="font-bold text-green-400">Earn</span>
            </p>
          </RevealUp>
        </ParallaxSection>
      </div>
    </section>
  );
}