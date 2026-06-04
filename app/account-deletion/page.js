import { Suspense } from 'react';
import AccountDeletionFlow from './AccountDeletionFlow';

export const metadata = {
  title: 'Account deletion | G-R Gabriella Romeo',
  description: 'Delete your G-R Gabriella Romeo account directly from the app.',
};

export default function AccountDeletionPage() {
  return (
    <Suspense fallback={<main className="gr-account-deletion-page" />}>
      <AccountDeletionFlow />
    </Suspense>
  );
}
