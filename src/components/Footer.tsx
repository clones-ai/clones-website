
interface FooterProps {
  isHomePage?: boolean;
}

export default function Footer({ isHomePage = false }: FooterProps) {
  return (
    <footer className={`relative ${isHomePage ? 'bg-black' : ''}`}>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
          {/* Main Footer Content */}
          <div className={`grid md:grid-cols-3 gap-6 mb-4`}>
            {/* Platform Links */}
            <div className="text-center">
              <h4 className="text-text-primary font-semibold mb-3 font-sans">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/forge" className="footer-link">Forge</a></li>
                <li><a href="/marketplace" className="footer-link">Marketplace</a></li>
                <li><a href="/meta-datasets" className="footer-link">Meta Datasets</a></li>
              </ul>
            </div>

            {/* Community Links */}
            <div className="text-center">
              <h4 className="text-text-primary font-semibold mb-3 font-sans">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://t.me/clonesonbase"
                  target="_blank"
                  rel="noopener noreferrer" className="footer-link" aria-label="Join Telegram">
                  Telegram
                  <svg className="inline w-3 h-3 ml-1 align-baseline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a></li>
                <li><a href="https://x.com/clones_ai"
                  target="_blank"
                  rel="noopener noreferrer" className="footer-link" aria-label="Follow on X (Twitter)">
                  X (Twitter)
                  <svg className="inline w-3 h-3 ml-1 align-baseline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a></li>
                <li><a href="https://github.com/clones-ai"
                  target="_blank"
                  rel="noopener noreferrer" className="footer-link" aria-label="Visit GitHub">
                  GitHub
                  <svg className="inline w-3 h-3 ml-1 align-baseline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="text-center">
              <h4 className="text-text-primary font-semibold mb-3 font-sans">General</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://clones.gitbook.io/clones.docs"
                  target="_blank"
                  rel="noopener noreferrer" className="footer-link">
                  Whitepaper
                  <svg className="inline w-3 h-3 ml-1 align-baseline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a></li>
                <li><a href="/privacy-policy" className="footer-link">Privacy Policy</a></li>
                <li><a href="/terms-conditions" className="footer-link">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer >
  );
}