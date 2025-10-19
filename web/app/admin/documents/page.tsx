import { Metadata } from 'next';
import { DocumentManagementDashboard } from '@/components/documents/document-management-dashboard';

export const metadata: Metadata = {
  title: 'Document Management | MANTIS',
  description: 'Manage document templates and generate documents',
};

export default function DocumentManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
        <p className="text-muted-foreground">
          Create templates and generate documents for infringements, notices, and reports
        </p>
      </div>
      <DocumentManagementDashboard />
    </div>
  );
}
