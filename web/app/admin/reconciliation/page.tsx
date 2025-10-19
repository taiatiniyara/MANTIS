import { Metadata } from 'next';
import { ReconciliationDashboard } from '@/components/payments/reconciliation-dashboard';

export const metadata: Metadata = {
  title: 'Payment Reconciliation | MANTIS',
  description: 'Reconcile daily payments and refunds',
};

export default function ReconciliationPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Payment Reconciliation</h1>
        <p className="text-muted-foreground">
          Review and approve daily payment reconciliations
        </p>
      </div>
      <ReconciliationDashboard />
    </div>
  );
}
