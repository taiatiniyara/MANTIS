import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integrations | MANTIS',
  description: 'Manage API keys, webhooks, and third-party integrations',
};

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Integrations & API</h1>
        <p className="text-muted-foreground">
          Manage API keys, webhooks, and external service integrations
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-bold mb-4">API Keys</h2>
          <p className="text-muted-foreground mb-4">
            Generate API keys for programmatic access to MANTIS
          </p>
          <div className="bg-muted p-4 rounded-md">
            <code className="text-sm">
              POST /api/public/infringements<br />
              Authorization: Bearer mantis_your_api_key_here
            </code>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Webhooks</h2>
          <p className="text-muted-foreground mb-4">
            Configure webhooks to receive real-time notifications
          </p>
          <div className="space-y-2">
            <div><strong>Events:</strong> infringement.created, payment.completed, appeal.submitted</div>
            <div><strong>Signature:</strong> HMAC SHA256 verification included</div>
            <div><strong>Retries:</strong> Automatic retry with exponential backoff</div>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Service Integrations</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="border p-4 rounded-md">
              <h3 className="font-bold">Payment Gateways</h3>
              <p className="text-sm text-muted-foreground">Stripe, PayPal, M-Pesa</p>
            </div>
            <div className="border p-4 rounded-md">
              <h3 className="font-bold">Messaging</h3>
              <p className="text-sm text-muted-foreground">Twilio SMS, SendGrid Email</p>
            </div>
            <div className="border p-4 rounded-md">
              <h3 className="font-bold">Storage</h3>
              <p className="text-sm text-muted-foreground">AWS S3, Azure Blob</p>
            </div>
            <div className="border p-4 rounded-md">
              <h3 className="font-bold">Analytics</h3>
              <p className="text-sm text-muted-foreground">Google Analytics, Mixpanel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
