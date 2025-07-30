import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ForgePage from './pages/ForgePage';
import MarketplacePage from './pages/MarketplacePage';
import DatabankPage from './pages/DatabankPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/forge" element={<ForgePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/databank" element={<DatabankPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;