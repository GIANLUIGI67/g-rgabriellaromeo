'use client';
import { Suspense } from 'react';
import VenditePageContent from './VenditePageContent';

export default function VenditePageWrapper() {
  return (
    <Suspense fallback={<div>Loading vendite...</div>}>
      <VenditePageContent />
    </Suspense>
  );
}
