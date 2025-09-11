import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MobileNavigation from './MobileNavigation';
import DesktopNavigation from './DesktopNavigation';
import ConnectWalletButton from '../features/wallet/ConnectWalletButton';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Simplified Navigation Background */}
      <div className="absolute inset-0 bg-primary-900/10 backdrop-blur-xl border-b border-primary-500/20"></div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between relative z-10">
          {/* Logo - Responsive sizing */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity duration-200"
              onClick={closeMobileMenu}
            >
              <img
                src="/clones-logo-white.svg"
                alt="CLONES"
                className="h-6 sm:h-8 w-auto hover:drop-shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-200"
              />
              <span className="text-lg sm:text-xl font-medium">CLONES</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <DesktopNavigation />

          {/* Wallet Connect & Mobile Navigation */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Wallet Connect Button - Hidden on small mobile */}
            <div className="hidden sm:block">
              <ConnectWalletButton />
            </div>

            {/* Mobile Menu Component */}
            <MobileNavigation
              isOpen={isMobileMenuOpen}
              onToggle={toggleMobileMenu}
              onClose={closeMobileMenu}
            />
          </div>
        </div>
      </div>
    </header>
  );
}