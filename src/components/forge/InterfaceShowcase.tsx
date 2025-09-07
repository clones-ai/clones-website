import React, { useState } from 'react';
import { Reveal, RevealUp } from '../motion/Reveal';
import { AnimatedButton } from '../motion/AnimatedButton';

interface SlideData {
  id: string;
  title: string;
  description: string;
  image: string;

}

const slides: SlideData[] = [
  {
    id: 'recording',
    title: 'Task Recording Interface',
    description: 'Advanced recording system that captures every interaction for AI training.',
    image: '/taskRecording.webp',
  },
  {
    id: 'exploration',
    title: 'Factory Exploration Page',
    description: 'Browse and discover AI training environments that match your skills.',
    image: '/taskExploration.webp',
  },
  {
    id: 'rewards',
    title: 'Reward Tracking Dashboard',
    description: 'Real-time dashboard for tracking earnings and performance metrics.',
    image: '/taskReward.webp',
  }
];

export function InterfaceShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);

  const currentSlide = slides[activeSlide];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const previousSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <>


      <section className="py-12 md:py-20 px-4 sm:px-6 bg-transparent">
        <RevealUp distance={6}>
          <div className="relative mb-12">
            <div className="max-w-5xl mx-auto">

              {/* Single Dominant Image */}
              <div className="relative group">
                <div className="relative overflow-hidden rounded-xl md:rounded-2xl border border-white/10">
                  <img
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    className="w-full h-[250px] xs:h-[300px] sm:h-[350px] md:h-[450px] lg:h-[500px] xl:h-[550px] object-contain sm:object-cover transition-transform duration-700 group-hover:scale-105" />

                  {/* Overlay with gradient for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Elegant Navigation Arrows */}
                  <button
                    className="nav-arrow nav-arrow-left absolute left-3 md:left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    onClick={previousSlide}
                    aria-label="Previous slide"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>

                  <button
                    className="nav-arrow nav-arrow-right absolute right-3 md:right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    onClick={nextSlide}
                    aria-label="Next slide"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Enhanced Descriptive Content */}
              <RevealUp distance={4}>
                <div className="text-center mt-6 md:mt-8 mb-6 md:mb-8">
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl sm:text-3xl font-medium text-text-primary mb-4 md:mb-6">
                      {currentSlide.title}
                    </h3>
                    <p className="text-base md:text-lg text-text-tertiary mb-6 md:mb-8">
                      {currentSlide.description}
                    </p>
                  </div>
                </div>
              </RevealUp>

              {/* Enhanced Navigation Dots */}
              <RevealUp distance={3}>
                <div className="flex justify-center items-center gap-2 md:gap-4 mb-6 md:mb-8">
                  <div className="flex items-center gap-2 md:gap-3">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        className={`slide-dot ${index === activeSlide ? 'active' : ''}`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </RevealUp>

              {/* Prominent CTA */}
              <RevealUp distance={2}>
                <div className="text-center">
                  <AnimatedButton
                    variant="primary"
                    size="lg"
                    className="text-lg md:text-xl font-sans"
                  >
                    Launch Forge App
                  </AnimatedButton>
                </div>
              </RevealUp>
            </div>
          </div>
        </RevealUp>
      </section>

    </>
  );
}