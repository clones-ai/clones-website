import React, { useState } from 'react';
import { XIcon } from 'lucide-react';

export default function HomePage() {
  const [showVideoPopup, setShowVideoPopup] = useState(false);

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <div className="relative h-screen">
        <spline-viewer 
          url="https://prod.spline.design/BknCtcxqfZULt3ch/scene.splinecode"
          loading="lazy"
          width="100%"
          height="100vh"
          background="transparent"
          auto-rotate="false"
          auto-play="true"
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h1 
            className="text-[60px] font-light text-[#F8FAFC] tracking-[3px] select-none transform -translate-x-3 translate-y-3 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif' }}
          >
            CLONES
          </h1>
          <p 
            className="text-sm text-[#94A3B8] mt-2 select-none tracking-wide font-medium"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif' }}
          >
            Train. Tokenize. Execute.
          </p>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center px-4 text-center mt-20 mb-32">
        <h2 className="text-5xl md:text-6xl font-light text-[#F8FAFC] mb-8 tracking-wide text-center leading-tight">
          Create a million versions of yourself
        </h2>
        <p className="text-xl md:text-2xl text-[#94A3B8] max-w-4xl mx-auto leading-relaxed mb-12 text-center font-light">
          Everything. Everywhere. All at once.
        </p>
        <div className="flex justify-center">
          <button 
            onClick={() => setShowVideoPopup(true)}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-[#F8FAFC] rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative font-medium tracking-wide">Meet Your Clone</span>
          </button>
        </div>
      </div>

      {/* Divider between sections */}
      <div className="relative flex justify-center py-8">
        <div className="relative">
          <div className="w-96 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/40 to-transparent"></div>
          <div className="absolute inset-0 w-96 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/30 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Video Popup */}
      {showVideoPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowVideoPopup(false)}
          ></div>
          
          {/* Video Container */}
          <div className="relative z-10 w-full max-w-4xl mx-4">
            <div className="relative bg-black rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.3)]">
              {/* Close Button */}
              <button
                onClick={() => setShowVideoPopup(false)}
                className="absolute top-4 right-4 z-20 p-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-black/50 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                <XIcon className="w-6 h-6" />
              </button>
              
              {/* Video Content - Full Container */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
                <video
                  className="w-full h-full object-cover rounded-2xl"
                  controls
                  autoPlay
                  muted
                  poster="https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=675&fit=crop&crop=center"
                >
                  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.webm" type="video/webm" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Video overlay for loading state */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="text-[#F8FAFC] text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center">
                      <span className="text-2xl">🎬</span>
                    </div>
                    <p className="text-sm font-medium">CLONES Demo Video</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}