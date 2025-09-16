import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { SmoothScroll } from './components/motion/SmoothScroll';
import { ScrollToTop } from './components/motion/ScrollToTop';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { CriticalResourcePreloader, usePerformanceMonitoring } from './components/shared/CriticalResourcePreloader';
import { PerformanceMonitor } from './components/shared/PerformanceMonitor';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import WalletProvider from './features/wallet/WalletProvider';
import SoonPage from './pages/SoonPage';
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
const TransactionPage = React.lazy(() =>
  import(/* webpackChunkName: "transaction" */ './pages/TransactionPage')
);
const ErrorPage = React.lazy(() =>
  import(/* webpackChunkName: "error" */ './pages/ErrorPage')
);

// Preload critical routes on idle
if ('requestIdleCallback' in window) {
  (window as any).requestIdleCallback(() => {
    // Preload Forge (most likely next page)
    import('./pages/ForgePage');
  });
}

const soon = false;

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen text-text-primary pt-20">
      <Navigation />
      <ErrorBoundary>
        <main className="transform-gpu">
          <React.Suspense>
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
              <Route path="/wallet/transaction" element={<TransactionPage />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </React.Suspense>
        </main>
      </ErrorBoundary>
      <Footer isHomePage={isHomePage} />
    </div>
  );
}

function App() {
  // Monitor performance metrics
  usePerformanceMonitoring();

  if (soon) {
    return <SoonPage />;
  }
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
          {/* Dedicated container for glow cloud effects */}
          <div className="glow-cloud-container"></div>
          <AppContent />
        </Router>
      </SmoothScroll>
    </WalletProvider>
  );
}

export default App;// Test comment
