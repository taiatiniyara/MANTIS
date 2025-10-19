import { Metadata } from 'next';
import { PaymentManagementDashboard } from '@/components/payments/payment-management-dashboard';

export const metadata: Metadata = {
  title: 'Payment Management | MANTIS',
  description: 'Manage payments and refunds',
};

export default function PaymentManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
        <p className="text-muted-foreground">
          Track payments, process refunds, and manage transactions
        </p>
      </div>
      <PaymentManagementDashboard />
    </div>
  );
}
