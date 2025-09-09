
interface FooterProps {
  isHomePage?: boolean;
}

export default function Footer({ isHomePage = false }: FooterProps) {
  return (
    <footer className={`relative ${isHomePage ? 'bg-black' : ''}`}>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
          {/* Main Footer Content */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mb-4">
            {/* Platform Links */}
            <div>
              <h4 className="text-text-primary font-semibold mb-3 font-sans">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/forge" className="footer-link">Forge</a></li>
                <li><a href="/marketplace" className="footer-link">Marketplace</a></li>
                <li><a href="/meta-datasets" className="footer-link">Meta Datasets</a></li>
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h4 className="text-text-primary font-semibold mb-3 font-sans">Community</h4>
              <ul className="space-y-2 text-sm">
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
              <h4 className="text-text-primary font-semibold mb-3 font-sans">General</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://clones.gitbook.io/clones.docs"
                  target="_blank"
                  rel="noopener noreferrer" className="footer-link">Whitepaper</a></li>
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