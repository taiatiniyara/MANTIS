'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClient } from '@/lib/supabase/client';
import { FileText, Download, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Reconciliation {
  id: string;
  reconciliation_date: string;
  agency_id: string | null;
  total_payments: number;
  total_refunds: number;
  net_amount: number;
  payment_count: number;
  refund_count: number;
  status: string;
  submitted_at: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  agency: {
    name: string;
  }[] | null;
}

const statusColors = {
  draft: 'bg-gray-500',
  submitted: 'bg-blue-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
};

export function ReconciliationDashboard() {
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedAgency, setSelectedAgency] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadReconciliations();
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setAgencies(data || []);
    } catch (error) {
      console.error('Error loading agencies:', error);
    }
  };

  const loadReconciliations = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_reconciliations')
        .select(`
          *,
          agency:agencies(name)
        `)
        .order('reconciliation_date', { ascending: false });

      if (error) throw error;
      setReconciliations(data || []);
    } catch (error) {
      console.error('Error loading reconciliations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReconciliation = async () => {
    try {
      const { data: newRecon, error: insertError } = await supabase
        .from('payment_reconciliations')
        .insert({
          reconciliation_date: selectedDate,
          agency_id: selectedAgency === 'all' ? null : selectedAgency,
          notes,
          status: 'draft',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Calculate totals
      await fetch('/api/payments/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reconciliation_id: newRecon.id }),
      });

      setIsCreateDialogOpen(false);
      setNotes('');
      loadReconciliations();
    } catch (error) {
      console.error('Error creating reconciliation:', error);
    }
  };

  const submitReconciliation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_reconciliations')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      loadReconciliations();
    } catch (error) {
      console.error('Error submitting reconciliation:', error);
    }
  };

  const approveReconciliation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_reconciliations')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      loadReconciliations();
    } catch (error) {
      console.error('Error approving reconciliation:', error);
    }
  };

  const exportReconciliation = async (recon: Reconciliation) => {
    const csv = [
      ['Reconciliation Report'].join(','),
      [`Date: ${format(new Date(recon.reconciliation_date), 'MMMM dd, yyyy')}`].join(','),
      [`Agency: ${recon.agency?.[0]?.name || 'All Agencies'}`].join(','),
      [''].join(','),
      ['Metric', 'Value'].join(','),
      ['Total Payments', `$${recon.total_payments.toFixed(2)}`].join(','),
      ['Payment Count', recon.payment_count.toString()].join(','),
      ['Total Refunds', `$${recon.total_refunds.toFixed(2)}`].join(','),
      ['Refund Count', recon.refund_count.toString()].join(','),
      ['Net Amount', `$${recon.net_amount.toFixed(2)}`].join(','),
      ['Status', recon.status].join(','),
      ['Notes', recon.notes || 'N/A'].join(','),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconciliation-${format(new Date(recon.reconciliation_date), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const stats = {
    total: reconciliations.length,
    draft: reconciliations.filter(r => r.status === 'draft').length,
    submitted: reconciliations.filter(r => r.status === 'submitted').length,
    approved: reconciliations.filter(r => r.status === 'approved').length,
    totalNet: reconciliations
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.net_amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reconciliations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approved} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Net Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalNet.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From approved reconciliations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">
              Not yet submitted
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment Reconciliations</CardTitle>
              <CardDescription>Review and approve daily payment reconciliations</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              New Reconciliation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Payments</TableHead>
                  <TableHead>Refunds</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : reconciliations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No reconciliations found
                    </TableCell>
                  </TableRow>
                ) : (
                  reconciliations.map((recon) => (
                    <TableRow key={recon.id}>
                      <TableCell className="font-medium">
                        {format(new Date(recon.reconciliation_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {recon.agency?.[0]?.name || 'All Agencies'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            ${recon.total_payments.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {recon.payment_count} payments
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-red-600">
                            -${recon.total_refunds.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {recon.refund_count} refunds
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        ${recon.net_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[recon.status as keyof typeof statusColors]}>
                          {recon.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportReconciliation(recon)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                          {recon.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => submitReconciliation(recon.id)}
                            >
                              Submit
                            </Button>
                          )}
                          {recon.status === 'submitted' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approveReconciliation(recon.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Reconciliation</DialogTitle>
            <DialogDescription>
              Generate a new payment reconciliation report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recon-date">Reconciliation Date</Label>
              <input
                id="recon-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <Label htmlFor="recon-agency">Agency (Optional)</Label>
              <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agencies</SelectItem>
                  {agencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recon-notes">Notes (Optional)</Label>
              <Textarea
                id="recon-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this reconciliation..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createReconciliation}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
