import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ForgePage from './pages/ForgePage';
import MarketplacePage from './pages/MarketplacePage';
import DatabankPage from './pages/DatabankPage';
import ConnectPage from './pages/ConnectPage';
import { WalletProvider } from './features/wallet';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/forge" element={<ForgePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/databank" element={<DatabankPage />} />
            <Route path="/connect" element={<ConnectPage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;