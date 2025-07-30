import React from 'react';
import { Link } from 'react-router-dom';
import { XIcon, Send, BookOpen, Hammer, Rocket, Box } from 'lucide-react';
import { ConnectWalletButton } from '../features/wallet';

export default function Navigation() {
  return (
    <>
      {/* Floating Navigation with CLONES branding */}
      <nav className="fixed top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="relative flex items-center gap-1 px-6 py-3 bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
          {/* Cyberpunk glow border */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#EC4899] opacity-20 blur-sm animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border border-transparent bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#EC4899] bg-clip-border opacity-30"></div>
          <div className="relative flex items-center gap-1">
            <Link
              to="/forge"
              className="group relative flex items-center gap-3 px-4 py-2 text-[#E2E8F0] hover:text-[#F8FAFC] transition-all duration-200 hover:-translate-y-0.5 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]"
            >
              <Hammer className="w-5 h-5 stroke-[1.5]" />
              <span className="text-sm font-medium tracking-wide">Forge</span>
            </Link>

            <div className="w-px h-4 bg-white/10"></div>

            <Link
              to="/marketplace"
              className="group relative flex items-center gap-3 px-4 py-2 text-[#E2E8F0] hover:text-[#F8FAFC] transition-all duration-200 hover:-translate-y-0.5 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
            >
              <Rocket className="w-5 h-5 stroke-[1.5]" />
              <span className="text-sm font-medium tracking-wide">Marketplace</span>
            </Link>

            <div className="w-px h-4 bg-white/10"></div>

            <Link
              to="/databank"
              className="group relative flex items-center gap-3 px-4 py-2 text-[#E2E8F0] hover:text-[#F8FAFC] transition-all duration-200 hover:-translate-y-0.5 hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]"
            >
              <Box className="w-5 h-5 stroke-[1.5]" />
              <span className="text-sm font-medium tracking-wide">Databank</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Social Icons with CLONES styling */}
      <div className="fixed top-8 right-8 flex items-center gap-6 z-10">
        <ConnectWalletButton />
        <a
          href="https://x.com/Nexuscreature"
          className="text-[#94A3B8] hover:text-[#F8FAFC] hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)] transition-all duration-300"
          aria-label="X (Twitter)"
          target="_blank"
          rel="noopener noreferrer"
        >
          <XIcon className="w-6 h-6 stroke-[1.5]" />
        </a>
        <a
          href="#"
          className="text-[#94A3B8] hover:text-[#F8FAFC] hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-all duration-300"
          aria-label="Telegram"
        >
          <Send className="w-6 h-6 stroke-[1.5]" />
        </a>
        <a
          href="https://nexus-creature.gitbook.io/nexus-docs"
          className="text-[#94A3B8] hover:text-[#F8FAFC] hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.4)] transition-all duration-300"
          aria-label="GitBook"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BookOpen className="w-6 h-6 stroke-[1.5]" />
        </a>
      </div>
    </>
  );
}