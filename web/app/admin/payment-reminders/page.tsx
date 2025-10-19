import { Metadata } from 'next';
import { PaymentReminderSystem } from '@/components/payments/payment-reminder-system';

export const metadata: Metadata = {
  title: 'Payment Reminders | MANTIS',
  description: 'Send and track payment reminders',
};

export default function PaymentRemindersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Payment Reminders</h1>
        <p className="text-muted-foreground">
          Send and track payment reminder notifications for unpaid infringements
        </p>
      </div>
      <PaymentReminderSystem />
    </div>
  );
}
