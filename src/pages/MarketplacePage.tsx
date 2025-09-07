import React from 'react';
import { MarketplaceHero } from '../components/marketplace/MarketplaceHero';
import { HowItWorks } from '../components/marketplace/HowItWorks';
import { WhatYoureTrading } from '../components/marketplace/WhatYoureTrading';
import { BurnPortal } from '../components/marketplace/BurnPortal';
import { SimpleParallaxTransition } from '../components/motion/SimpleParallaxTransition';

export default function MarketplacePage() {
  return (
    <div className="text-text-primary">
      <MarketplaceHero />
      
      <SimpleParallaxTransition variant="orbs" height="h-32" />
      
      <HowItWorks />
      
      <SimpleParallaxTransition variant="lines" height="h-24" />
      
      <WhatYoureTrading />
      
      <SimpleParallaxTransition variant="gradient" height="h-32" />
      
      <BurnPortal />
    </div>
  );
}