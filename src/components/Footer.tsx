
export default function Footer() {
  return (
    <footer className="relative">
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
          {/* Main Footer Content */}
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 mb-12">
            {/* Brand Section */}
            <div className="space-y-">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src="/clones-logo-white.svg"
                    alt="CLONES"
                    className="h-6 sm:h-8 w-auto hover:drop-shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-200"
                  />
                  <h3 className="text-2xl font-sans">CLONES</h3>
                </div>
              </div>
              <p className="text-text-tertiary text-xs italic font-mono-jetbrains">
                By the people, For the people
              </p>
              <div className="flex items-center gap-6 text-sm text-text-tertiary mt-11">
                <span>© CLONES 2025</span>
                <span>All Rights Reserved</span>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-text-primary font-semibold mb-4 font-sans">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/forge" className="footer-link">Forge</a></li>
                <li><a href="/marketplace" className="footer-link">Marketplace</a></li>
                <li><a href="/meta-datasets" className="footer-link">Meta Datasets</a></li>
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h4 className="text-text-primary font-semibold mb-4 font-sans">Community</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://t.me/clonesonbase"
                  target="_blank"
                  rel="noopener noreferrer" className="footer-link" aria-label="Join Telegram">Telegram</a></li>
                <li><a href="https://x.com/clones_ai"
                  target="_blank"
                  rel="noopener noreferrer" className="footer-link" aria-label="Follow on X (Twitter)">X (Twitter)</a></li>
                <li><a href="https://github.com/clones-ai"
                  target="_blank"
                  rel="noopener noreferrer" className="footer-link" aria-label="Visit GitHub">GitHub</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-text-primary font-semibold mb-4 font-sans">General</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://clones.gitbook.io/clones.docs"
                  target="_blank"
                  rel="noopener noreferrer" className="footer-link">Documentation</a></li>
                <li><a href="/privacy-policy" className="footer-link">Privacy Policy</a></li>
                <li><a href="/terms-conditions" className="footer-link">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}