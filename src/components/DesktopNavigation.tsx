import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function DesktopNavigation() {
  const location = useLocation();

  const navigationLinks = [
    { to: '/forge', label: 'Forge' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/meta-datasets', label: 'Meta-datasets' }
  ];

  return (
    <nav className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-8">
      {navigationLinks.map(({ to, label }) => {
        const isActive = location.pathname === to;

        return (
          <Link
            key={to}
            to={to}
            className={`nav-link relative px-4 py-2 font-medium transition-all duration-200 ${
              isActive
                ? 'text-purple-400'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            style={isActive ? { color: '#a855f7 !important' } : {}}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}