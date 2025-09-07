import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-6"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-text-tertiary mt-4"
          >
            Last Updated: September 6, 2025
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-lg max-w-none"
          >
            <div className="space-y-12">

              {/* Scope */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">1. Scope</h2>
                <p className="text-text-secondary">
                  This Privacy Policy explains how we collect, use, and protect information when you use the CLONES website, Platform, and services.
                </p>
              </div>

              {/* Decentralized Nature */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">2. Decentralized Nature</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">CLONES is a decentralized protocol. We do not require KYC or custody user wallets.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Blockchain transactions are public, permanent, and outside our control.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Users are responsible for safeguarding their own wallet credentials.</p>
                  </div>
                </div>
              </div>

              {/* Information We Collect */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">3. Information We Collect</h2>
                <p className="text-text-secondary mb-4">We collect minimal information:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Basic web analytics (IP, browser type) for security and performance.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Voluntary submissions (e.g., email, community handles).</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Public smart contract interactions recorded on-chain.</p>
                  </div>
                </div>
                <p className="text-text-secondary mt-4">
                  We do not collect government IDs, banking information, or sensitive personal data.
                </p>
              </div>

              {/* How We Use Information */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">4. How We Use Information</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">To operate and improve the website and user experience.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">To monitor security and prevent abuse.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">To send updates and community news (opt-in).</p>
                  </div>
                </div>
              </div>

              {/* Sharing of Information */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">5. Sharing of Information</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">We do not sell personal data.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Limited service providers (hosting, analytics) may process minimal data.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">On-chain data is inherently public.</p>
                  </div>
                </div>
              </div>

              {/* Cookies & Analytics */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">6. Cookies & Analytics</h2>
                <p className="text-text-secondary">
                  The website may use cookies for analytics and performance. You may disable cookies in your browser.
                </p>
              </div>

              {/* Data Security */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">7. Data Security</h2>
                <p className="text-text-secondary">
                  We use reasonable safeguards, but no system is perfectly secure. Blockchain carries inherent risks outside our control.
                </p>
              </div>

              {/* Data Retention */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">8. Data Retention</h2>
                <p className="text-text-secondary">
                  We retain only minimal data as long as necessary. On-chain records are immutable and cannot be deleted.
                </p>
              </div>

              {/* Children's Privacy */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">9. Children's Privacy</h2>
                <p className="text-text-secondary">
                  The Platform is not for children under 13 (or the digital consent age in your country). We do not knowingly collect data from children.
                </p>
              </div>

              {/* International Users */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">10. International Users</h2>
                <p className="text-text-secondary">
                  By using the Platform, you acknowledge that data may be processed across jurisdictions.
                </p>
              </div>

              {/* Changes to Privacy Policy */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">11. Changes to Privacy Policy</h2>
                <p className="text-text-secondary">
                  We may update this Privacy Policy as needed. Continued use of the Platform constitutes acceptance of updates.
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}