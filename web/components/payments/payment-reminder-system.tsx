'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Mail, MessageSquare, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';

interface Reminder {
  id: string;
  infringement_id: string;
  reminder_type: string;
  reminder_method: string;
  sent_at: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  status: string;
  opened_at: string | null;
  clicked_at: string | null;
  infringement: {
    infringement_number: string;
    offender_name: string;
    offender_email: string;
    offender_phone: string;
  }[];
}

interface UnpaidInfringement {
  id: string;
  infringement_number: string;
  offender_name: string;
  offender_email: string;
  offender_phone: string;
  type: {
    fine_amount: number;
  }[];
  issue_date: string;
  due_date: string;
}

export function PaymentReminderSystem() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [unpaidInfringements, setUnpaidInfringements] = useState<UnpaidInfringement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedInfringement, setSelectedInfringement] = useState<UnpaidInfringement | null>(null);
  const [reminderType, setReminderType] = useState('first');
  const [reminderMethod, setReminderMethod] = useState('email');
  

  useEffect(() => {
    loadReminders();
    loadUnpaidInfringements();
  }, []);

  const loadReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_reminders')
        .select(`
          *,
          infringement:infringements(
            infringement_number,
            offender_name,
            offender_email,
            offender_phone
          )
        `)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnpaidInfringements = async () => {
    try {
      // Get infringements without completed payments
      const { data: allInfringements, error: infError } = await supabase
        .from('infringements')
        .select(`
          id,
          infringement_number,
          offender_name,
          offender_email,
          offender_phone,
          issue_date,
          due_date,
          type:infringement_types(fine_amount)
        `)
        .order('issue_date', { ascending: false });

      if (infError) throw infError;

      // Get all completed payment infringement IDs
      const { data: paidInfringements } = await supabase
        .from('payments')
        .select('infringement_id')
        .eq('status', 'completed');

      const paidIds = new Set(paidInfringements?.map(p => p.infringement_id) || []);

      // Filter out paid infringements
      const unpaid = allInfringements?.filter(inf => !paidIds.has(inf.id)) || [];
      setUnpaidInfringements(unpaid);
    } catch (error) {
      console.error('Error loading unpaid infringements:', error);
    }
  };

  const sendReminder = async () => {
    if (!selectedInfringement) return;

    try {
      const { error } = await supabase.from('payment_reminders').insert({
        infringement_id: selectedInfringement.id,
        reminder_type: reminderType,
        reminder_method: reminderMethod,
        recipient_email: reminderMethod === 'email' ? selectedInfringement.offender_email : null,
        recipient_phone: reminderMethod === 'sms' ? selectedInfringement.offender_phone : null,
        status: 'sent',
      });

      if (error) throw error;

      // In production, trigger actual email/SMS sending here
      // await fetch('/api/payments/send-reminder', {
      //   method: 'POST',
      //   body: JSON.stringify({ ... })
      // });

      setIsSendDialogOpen(false);
      setSelectedInfringement(null);
      loadReminders();
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const sendBulkReminders = async () => {
    try {
      // Send reminders to all unpaid infringements without recent reminders
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Don't send if sent in last 7 days

      for (const infringement of unpaidInfringements) {
        // Check if reminder was sent recently
        const { data: recentReminder } = await supabase
          .from('payment_reminders')
          .select('id')
          .eq('infringement_id', infringement.id)
          .gte('sent_at', cutoffDate.toISOString())
          .single();

        if (!recentReminder && infringement.offender_email) {
          await supabase.from('payment_reminders').insert({
            infringement_id: infringement.id,
            reminder_type: 'first',
            reminder_method: 'email',
            recipient_email: infringement.offender_email,
            status: 'sent',
          });
        }
      }

      loadReminders();
    } catch (error) {
      console.error('Error sending bulk reminders:', error);
    }
  };

  const stats = {
    total: reminders.length,
    sent: reminders.filter(r => r.status === 'sent').length,
    delivered: reminders.filter(r => r.status === 'delivered').length,
    opened: reminders.filter(r => r.opened_at).length,
    unpaid: unpaidInfringements.length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reminders</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.delivered} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Opened</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.opened}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.opened / stats.total) * 100).toFixed(1) : 0}% open rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Infringements</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unpaid}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unpaidInfringements.filter(i => new Date(i.due_date) < new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment Reminders</CardTitle>
              <CardDescription>Send and track payment reminder notifications</CardDescription>
            </div>
            <Button onClick={sendBulkReminders}>
              <Send className="h-4 w-4 mr-2" />
              Send Bulk Reminders
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Unpaid Infringements */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Unpaid Infringements</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Infringement</TableHead>
                    <TableHead>Offender</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidInfringements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No unpaid infringements
                      </TableCell>
                    </TableRow>
                  ) : (
                    unpaidInfringements.slice(0, 10).map((infringement) => {
                      const isOverdue = new Date(infringement.due_date) < new Date();
                      return (
                        <TableRow key={infringement.id}>
                          <TableCell className="font-medium">
                            {infringement.infringement_number}
                          </TableCell>
                          <TableCell>{infringement.offender_name}</TableCell>
                          <TableCell className="font-medium">
                            ${infringement.type?.[0]?.fine_amount || 0}
                          </TableCell>
                          <TableCell>
                            <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
                              {format(new Date(infringement.due_date), 'MMM dd, yyyy')}
                              {isOverdue && (
                                <Badge variant="destructive" className="ml-2">Overdue</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{infringement.offender_email || 'No email'}</div>
                              <div className="text-muted-foreground">
                                {infringement.offender_phone || 'No phone'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInfringement(infringement);
                                setIsSendDialogOpen(true);
                              }}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Send Reminder
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Reminder History */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Reminder History</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Infringement</TableHead>
                    <TableHead>Offender</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : reminders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No reminders sent yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    reminders.slice(0, 20).map((reminder) => (
                      <TableRow key={reminder.id}>
                        <TableCell className="font-medium">
                          {reminder.infringement?.[0]?.infringement_number || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {reminder.infringement?.[0]?.offender_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{reminder.reminder_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {reminder.reminder_method === 'email' ? (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              Email
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              SMS
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(reminder.sent_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                reminder.status === 'delivered'
                                  ? 'bg-green-500'
                                  : reminder.status === 'failed'
                                  ? 'bg-red-500'
                                  : 'bg-blue-500'
                              }
                            >
                              {reminder.status}
                            </Badge>
                            {reminder.opened_at && (
                              <Badge variant="outline" className="bg-green-50">
                                Opened
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Reminder Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a payment reminder for infringement {selectedInfringement?.infringement_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reminder-type">Reminder Type</Label>
              <Select value={reminderType} onValueChange={setReminderType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">First Reminder</SelectItem>
                  <SelectItem value="second">Second Reminder</SelectItem>
                  <SelectItem value="final">Final Notice</SelectItem>
                  <SelectItem value="overdue">Overdue Notice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reminder-method">Delivery Method</Label>
              <Select value={reminderMethod} onValueChange={setReminderMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="mail">Postal Mail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm">
                <strong>Offender:</strong> {selectedInfringement?.offender_name}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {selectedInfringement?.offender_email || 'N/A'}
              </p>
              <p className="text-sm">
                <strong>Phone:</strong> {selectedInfringement?.offender_phone || 'N/A'}
              </p>
              <p className="text-sm">
                <strong>Amount:</strong> ${selectedInfringement?.type?.[0]?.fine_amount || 0}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendReminder}>
              <Send className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
