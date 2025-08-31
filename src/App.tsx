import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ForgePage from './pages/ForgePage';
import MarketplacePage from './pages/MarketplacePage';
import DatabankPage from './pages/DatabankPage';
import ConnectPage from './pages/ConnectPage';
import TransactionPage from './pages/TransactionPage';
import { WalletProvider } from './features/wallet';
import { ReferralPage } from './features/desktop';
import { FaucetPage } from './features/faucet';

const MainApp = () => (
  <div className="min-h-screen bg-black text-white">
    <Navigation />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/forge" element={<ForgePage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/databank" element={<DatabankPage />} />
      <Route path="/connect" element={<ConnectPage />} />
      <Route path="/faucet" element={<FaucetPage />} />
      <Route path="/wallet/transaction" element={<TransactionPage />} />
    </Routes>
    <Footer />
  </div>
);

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/r/:referralCode" element={<ReferralPage />} />
          <Route path="/referral/:referralCode" element={<ReferralPage />} />
          <Route path="/download" element={<ReferralPage />} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;