import React from 'react';
import { MetadatasetsHero } from '../components/metadatasets/MetadatasetsHero';
import { PrivateAllocation } from '../components/metadatasets/PrivateAllocation';
import { DataVault } from '../components/metadatasets/DataVault';
import { SimpleParallaxTransition } from '../components/motion/SimpleParallaxTransition';

export default function MetaDatasetsPage() {
  return (
    <div className="text-text-primary">
      <MetadatasetsHero />
      
      <SimpleParallaxTransition variant="gradient" height="h-32" />
      
      <PrivateAllocation />
      
      <SimpleParallaxTransition variant="orbs" height="h-24" />
      
      <DataVault />
    </div>
  );
}