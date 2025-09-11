import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function MobileNavigation({ isOpen, onToggle, onClose }: MobileNavigationProps) {
  const location = useLocation();

  const handleToggle = () => {
    onToggle();
  };

  // Close mobile menu when route changes (but not on initial mount)
  const prevPathname = React.useRef(location.pathname);
  useEffect(() => {
    if (prevPathname.current !== location.pathname && isOpen) {
      onClose();
    }
    prevPathname.current = location.pathname;
  }, [location.pathname, isOpen, onClose]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navigationLinks = [
    { to: '/', label: 'Home' },
    { to: '/forge', label: 'Forge' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/meta-datasets', label: 'Meta-Datasets' }
  ];

  return (
    <>
      {/* Hamburger Menu Button - Mobile/Tablet Only */}
      <button
        onClick={handleToggle}
        className="lg:hidden flex relative w-11 h-11 flex-col justify-center items-center gap-1.5 z-[70] touch-manipulation"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <span
          className={`w-6 h-0.5 bg-text-primary transition-all duration-300 transform origin-center ${isOpen ? 'rotate-45 translate-y-2' : ''
            }`}
        />
        <span
          className={`w-6 h-0.5 bg-text-primary transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'
            }`}
        />
        <span
          className={`w-6 h-0.5 bg-text-primary transition-all duration-300 transform origin-center ${isOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
        />
      </button>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-primary-900/30 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Mobile Menu Panel */}
        <div
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[85vw] sm:max-w-[320px] h-full bg-bg-primary/95 backdrop-blur-xl border border-primary-500/20 transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
        >
          {/* Menu Header */}
          <div className="p-6 border-b border-primary-500/10">
            <img
              src="/clones-logo-white.svg"
              alt="CLONES"
              className="h-8 w-auto"
            />
          </div>

          {/* Navigation Links */}
          <nav className="p-6 space-y-2">
            {navigationLinks.map(({ to, label }) => {
              const isActive = location.pathname === to;

              return (
                <Link
                  key={to}
                  to={to}
                  className={`block px-4 py-4 text-lg font-medium rounded-xl transition-all duration-200 min-h-[44px] flex items-center ${isActive
                    ? 'text-purple-400'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-quaternary/50'
                    }`}
                  style={isActive ? { color: '#a855f7' } : {}}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Social Links */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex justify-center gap-3 pt-6 border-t border-primary-500/10">
              <a
                href="https://x.com/clones_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Follow on X (Twitter)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </a>

              <a
                href="https://t.me/clonesonbase"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Join Telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>

              <a
                href="https://clones.gitbook.io/clones.docs"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="View Whitepaper"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10.802 17.77a.703.703 0 11-.002 1.406.703.703 0 01.002-1.406m11.024-4.347a.703.703 0 11.001-1.406.703.703 0 01-.001 1.406m0-2.876a2.176 2.176 0 00-2.174 2.174c0 .233.039.465.115.691l-7.181 3.823a2.165 2.165 0 00-1.784-.937c-.829 0-1.584.475-1.95 1.216l-6.451-3.402c-.682-.358-1.192-1.48-1.192-2.48 0-1.001.51-2.123 1.192-2.481L8.85 9.397a2.176 2.176 0 003.348-1.83 2.176 2.176 0 00-2.174-2.175c-.829 0-1.584.475-1.95 1.216L1.623 9.016C.941 9.374.431 10.496.431 11.497s.51 2.123 1.192 2.481l6.451 3.402c.366.741 1.121 1.216 1.95 1.216.829 0 1.584-.475 1.95-1.216l7.181-3.823c.682-.358 1.192-1.48 1.192-2.48 0-1.001-.51-2.123-1.192-2.481l-6.451-3.402c-.366-.741-1.121-1.216-1.95-1.216-.829 0-1.584.475-1.95 1.216L1.623 6.616C.941 6.974.431 8.096.431 9.097s.51 2.123 1.192 2.481l6.451 3.402c.366.741 1.121 1.216 1.95 1.216.829 0 1.584-.475 1.95-1.216l7.181-3.823c.682-.358 1.192-1.48 1.192-2.48 0-1.001-.51-2.123-1.192-2.481l-6.451-3.402c-.366-.741-1.121-1.216-1.95-1.216z" />
                </svg>
              </a>

              <a
                href="https://github.com/clones-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Visit GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

