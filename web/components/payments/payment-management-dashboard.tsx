'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClient } from '@/lib/supabase/client';
import { CreditCard, DollarSign, RefreshCw, Download, Search, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Payment {
  id: string;
  infringement_id: string;
  payment_reference: string;
  payment_method: string;
  payment_provider: string | null;
  amount: number;
  currency: string;
  status: string;
  paid_at: string | null;
  payer_name: string | null;
  payer_email: string | null;
  receipt_number: string | null;
  transaction_id: string | null;
  created_at: string;
  infringement: {
    infringement_number: string;
    offender_name: string;
  }[];
}

interface Refund {
  id: string;
  payment_id: string;
  refund_reference: string;
  amount: number;
  reason: string;
  status: string;
  processed_at: string | null;
  created_at: string;
  payment: {
    payment_reference: string;
    receipt_number: string;
  }[];
}

const statusColors = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  refunded: 'bg-purple-500',
  cancelled: 'bg-gray-500',
};

const statusIcons = {
  pending: Clock,
  processing: RefreshCw,
  completed: CheckCircle,
  failed: XCircle,
  refunded: DollarSign,
  cancelled: AlertCircle,
};

export function PaymentManagementDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadPayments();
    loadRefunds();
  }, [statusFilter, methodFilter]);

  const loadPayments = async () => {
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          infringement:infringements(infringement_number, offender_name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (methodFilter !== 'all') {
        query = query.eq('payment_method', methodFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRefunds = async () => {
    try {
      const { data, error } = await supabase
        .from('refunds')
        .select(`
          *,
          payment:payments(payment_reference, receipt_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRefunds(data || []);
    } catch (error) {
      console.error('Error loading refunds:', error);
    }
  };

  const processRefund = async () => {
    if (!selectedPayment || !refundAmount || !refundReason) return;

    try {
      const { error } = await supabase.from('refunds').insert({
        payment_id: selectedPayment.id,
        refund_reference: `REF-${Date.now()}`,
        amount: parseFloat(refundAmount),
        reason: refundReason,
        status: 'pending',
      });

      if (error) throw error;

      // Update payment status
      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', selectedPayment.id);

      setIsRefundDialogOpen(false);
      setRefundAmount('');
      setRefundReason('');
      setSelectedPayment(null);
      loadPayments();
      loadRefunds();
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  const downloadReceipt = async (payment: Payment) => {
    try {
      const response = await fetch(`/api/payments/receipt/${payment.id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${payment.receipt_number}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const exportPayments = () => {
    const csv = [
      ['Reference', 'Infringement', 'Method', 'Amount', 'Status', 'Paid At', 'Payer', 'Receipt'].join(','),
      ...filteredPayments.map(p =>
        [
          p.payment_reference,
          p.infringement?.[0]?.infringement_number || 'N/A',
          p.payment_method,
          p.amount,
          p.status,
          p.paid_at ? format(new Date(p.paid_at), 'yyyy-MM-dd HH:mm') : 'N/A',
          p.payer_name || 'N/A',
          p.receipt_number || 'N/A',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredPayments = payments.filter(
    p =>
      p.payment_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.infringement?.[0]?.infringement_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.payer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    refunded: refunds.length,
    totalAmount: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    refundAmount: refunds
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.completed} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.refundAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.refunded} refunds
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>Track and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="payments">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="refunds">Refunds</TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by reference, infringement, or payer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportPayments} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Payments Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Infringement</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No payments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => {
                        const StatusIcon = statusIcons[payment.status as keyof typeof statusIcons];
                        return (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                              {payment.payment_reference}
                            </TableCell>
                            <TableCell>
                              {payment.infringement?.[0]?.infringement_number || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{payment.payer_name || 'N/A'}</div>
                                <div className="text-sm text-muted-foreground">
                                  {payment.payer_email || ''}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {payment.payment_method.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              ${payment.amount.toFixed(2)} {payment.currency}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[payment.status as keyof typeof statusColors]}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {payment.paid_at
                                ? format(new Date(payment.paid_at), 'MMM dd, yyyy')
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {payment.receipt_number && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadReceipt(payment)}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Receipt
                                  </Button>
                                )}
                                {payment.status === 'completed' && !payment.receipt_number?.includes('REF-') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPayment(payment);
                                      setIsRefundDialogOpen(true);
                                    }}
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Refund
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="refunds" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Refund Reference</TableHead>
                      <TableHead>Payment Reference</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refunds.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No refunds found
                        </TableCell>
                      </TableRow>
                    ) : (
                      refunds.map((refund) => {
                        const StatusIcon = statusIcons[refund.status as keyof typeof statusIcons];
                        return (
                          <TableRow key={refund.id}>
                            <TableCell className="font-medium">
                              {refund.refund_reference}
                            </TableCell>
                            <TableCell>
                              {refund.payment?.[0]?.payment_reference || 'N/A'}
                            </TableCell>
                            <TableCell className="font-medium">
                              ${refund.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>{refund.reason}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[refund.status as keyof typeof statusColors]}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {refund.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {refund.processed_at
                                ? format(new Date(refund.processed_at), 'MMM dd, yyyy')
                                : format(new Date(refund.created_at), 'MMM dd, yyyy')}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Issue a refund for payment {selectedPayment?.payment_reference}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="refund-amount">Refund Amount</Label>
              <Input
                id="refund-amount"
                type="number"
                step="0.01"
                max={selectedPayment?.amount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Maximum: ${selectedPayment?.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <Label htmlFor="refund-reason">Reason</Label>
              <Textarea
                id="refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processRefund}>Process Refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
