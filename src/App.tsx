import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SmoothScroll } from './components/motion/SmoothScroll';
import { ScrollToTop } from './components/motion/ScrollToTop';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { CriticalResourcePreloader, usePerformanceMonitoring } from './components/shared/CriticalResourcePreloader';
import { PerformanceMonitor } from './components/shared/PerformanceMonitor';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import WalletProvider from './features/wallet/WalletProvider';
// Lazy load pages with intelligent preloading
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ForgePage = React.lazy(() =>
  import(/* webpackChunkName: "forge" */ './pages/ForgePage')
);
const MarketplacePage = React.lazy(() =>
  import(/* webpackChunkName: "marketplace" */ './pages/MarketplacePage')
);
const MetaDatasetsPage = React.lazy(() =>
  import(/* webpackChunkName: "metadatasets" */ './pages/MetadatasetsPage')
);
const PrivacyPolicyPage = React.lazy(() =>
  import(/* webpackChunkName: "privacy" */ './pages/PrivacyPolicyPage')
);
const TermsConditionsPage = React.lazy(() =>
  import(/* webpackChunkName: "terms" */ './pages/TermsConditionsPage')
);
const FaucetPage = React.lazy(() =>
  import(/* webpackChunkName: "faucet" */ './features/faucet/FaucetPage')
);
const ReferralPage = React.lazy(() =>
  import(/* webpackChunkName: "referral" */ './features/desktop/ReferralPage')
);
const ConnectPage = React.lazy(() =>
  import(/* webpackChunkName: "connect" */ './pages/ConnectPage')
);
// Preload critical routes on idle
if ('requestIdleCallback' in window) {
  (window as any).requestIdleCallback(() => {
    // Preload Forge (most likely next page)
    import('./pages/ForgePage');
  });
}

function App() {
  // Monitor performance metrics
  usePerformanceMonitoring();

  return (
    <WalletProvider>
      <SmoothScroll>
        <CriticalResourcePreloader
          images={[
            '/clones-logo-white.svg',
            '/taskExploration.webp',
            '/taskRecording.webp',
            '/taskReward.webp'
          ]}
        />
        <PerformanceMonitor showInDev={true} position="bottom-right" />
        <Router>
          <ScrollToTop />
          <div className="min-h-screen text-text-primary pt-20 transform-gpu">
            <Navigation />
            <ErrorBoundary>
              <main className="transform-gpu">
                <React.Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="ultra-premium-glass-card p-8 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-text-primary">Loading...</span>
                      </div>
                    </div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/forge" element={<ForgePage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/meta-datasets" element={<MetaDatasetsPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms-conditions" element={<TermsConditionsPage />} />
                    <Route path="/faucet" element={<FaucetPage />} />
                    <Route path="/download" element={<ReferralPage />} />
                    <Route path="/download/:referralCode" element={<ReferralPage />} />
                    <Route path="/connect" element={<ConnectPage />} />
                  </Routes>
                </React.Suspense>
              </main>
            </ErrorBoundary>
            <Footer />
          </div>
        </Router>
      </SmoothScroll>
    </WalletProvider>
  );
}

export default App;// Test comment
