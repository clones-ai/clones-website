import { motion } from 'framer-motion';

export default function TermsConditionsPage() {
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
            Terms & Conditions
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
              
              {/* Acceptance of Terms */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">1. Acceptance of Terms</h2>
                <p className="text-text-secondary">
                  By accessing or using the CLONES website, platform, or any associated services ("Platform"), you agree to these Terms. If you do not agree, do not use the Platform.
                </p>
              </div>

              {/* Nature of the Platform */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">2. Nature of the Platform</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">CLONES is a decentralized, community-driven infrastructure that enables datasets and functional code to be tokenized and licensed.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">The Platform operates on blockchain networks (e.g., Solana). Transactions are public, irreversible, and outside of our control.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">We do not custody user funds, guarantee liquidity, or provide investment advice.</p>
                  </div>
                </div>
              </div>

              {/* Eligibility */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">3. Eligibility</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">You must be at least 18 years old (or the age of majority in your jurisdiction) to use the Platform.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">By using the Platform, you represent that use is not prohibited by the laws of your jurisdiction.</p>
                  </div>
                </div>
              </div>

              {/* No Financial or Investment Advice */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">4. No Financial or Investment Advice</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Tokens on the Platform are utility-based license mechanisms, not securities.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Nothing on the Platform constitutes financial advice, legal advice, or solicitation.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">You are solely responsible for compliance with your local laws before buying, holding, burning, or trading tokens.</p>
                  </div>
                </div>
              </div>

              {/* Licensing & Usage Rights */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">5. Licensing & Usage Rights</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary"><strong>Burn-to-Redeem Access:</strong> When you burn the number of dataset tokens required by a creator's threshold, you are permanently granted a license to access and use the dataset/code.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Once redeemed, your license is permanent, non-revocable, and non-transferable.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">You receive the right to use the dataset/code but not ownership of the underlying intellectual property.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">You may not resell, sublicense, redistribute, or publicly release the dataset/code without explicit authorization.</p>
                  </div>
                </div>
              </div>

              {/* User Conduct */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">6. User Conduct</h2>
                <p className="text-text-secondary mb-4">You agree not to:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Attempt to reverse-engineer platform infrastructure or exfiltrate datasets/code beyond the scope of your license.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Use the Platform for unlawful purposes (including fraud, sanctions violations, or money laundering).</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Interfere with or attempt to exploit smart contracts or APIs in unintended ways.</p>
                  </div>
                </div>
              </div>

              {/* Intellectual Property */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">7. Intellectual Property</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">All datasets, models, and code available through the Platform remain the property of their respective creators and licensors.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Your license is limited to the defined scope of access you redeem.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">You are prohibited from claiming ownership or sublicensing rights without permission.</p>
                  </div>
                </div>
              </div>

              {/* Risks & Disclaimers */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">8. Risks & Disclaimers</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">You acknowledge and accept risks inherent to blockchain: volatility, loss of private keys, irreversible transactions, smart contract bugs, regulatory uncertainty.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">The Platform is provided "as is" without warranties of any kind.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">CLONES disclaims liability for losses or damages arising from use of the Platform, datasets, or code.</p>
                  </div>
                </div>
              </div>

              {/* Limitation of Liability */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">9. Limitation of Liability</h2>
                <p className="text-text-secondary">
                  To the maximum extent permitted by law, CLONES, its contributors, developers, and affiliates are not liable for any direct, indirect, incidental, or consequential damages arising from Platform use or dataset/code access.
                </p>
              </div>

              {/* Governing Law */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">10. Governing Law</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">These Terms are governed by general principles of international law.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-text-secondary">Where required, disputes will be resolved by arbitration under neutral venue (e.g., ICC or UNCITRAL rules).</p>
                  </div>
                </div>
              </div>

              {/* Changes to Terms */}
              <div className="ultra-premium-glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-text-primary mb-4">11. Changes to Terms</h2>
                <p className="text-text-secondary">
                  We may update these Terms at any time. Continued use of the Platform constitutes acceptance of revised Terms.
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}