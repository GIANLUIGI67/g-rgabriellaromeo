'use client';

import { Suspense } from 'react';
import PagamentoContent from './PagamentoContent';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useSearchParams } from 'next/navigation';

function PagamentoPageContent() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'it';

  return <PagamentoContent lang={lang} />;
}

export default function PagamentoPage() {
  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h2>
          <p className="mb-6 text-gray-700">
            We encountered an error while loading the payment page. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    }>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Loading payment options...</p>
          </div>
        </div>
      }>
        <PagamentoPageContent />
      </Suspense>
    </ErrorBoundary>
  );
}