'use client';

import { Suspense } from 'react';
import VenditePageContent from './VenditePageContent';

export default function VenditePageWrapper() {
  return (
    <Suspense fallback={null}>
      <VenditePageContent />
    </Suspense>
  );
}
