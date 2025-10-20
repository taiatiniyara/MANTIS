import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    
    const body = await request.json();
    const { reconciliation_id } = body;

    if (!reconciliation_id) {
      return NextResponse.json(
        { error: 'Reconciliation ID is required' },
        { status: 400 }
      );
    }

    // Get reconciliation details
    const { data: reconciliation, error: reconError } = await supabase
      .from('payment_reconciliations')
      .select('*')
      .eq('id', reconciliation_id)
      .single();

    if (reconError) throw reconError;

    // Calculate payment totals for the date
    let paymentsQuery = supabase
      .from('payments')
      .select('amount, infringement_id', { count: 'exact' })
      .eq('status', 'completed')
      .gte('paid_at', `${reconciliation.reconciliation_date}T00:00:00`)
      .lt('paid_at', `${reconciliation.reconciliation_date}T23:59:59`);

    if (reconciliation.agency_id) {
      // Filter by agency through infringement
      const { data: infringements } = await supabase
        .from('infringements')
        .select('id')
        .eq('agency_id', reconciliation.agency_id);

      const infringementIds = infringements?.map(i => i.id) || [];
      paymentsQuery = paymentsQuery.in('infringement_id', infringementIds);
    }

    const { data: payments, count: paymentCount, error: paymentsError } = await paymentsQuery;

    if (paymentsError) throw paymentsError;

    const totalPayments = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Calculate refund totals for the date
    let refundsQuery = supabase
      .from('refunds')
      .select('amount, payment_id', { count: 'exact' })
      .eq('status', 'completed')
      .gte('processed_at', `${reconciliation.reconciliation_date}T00:00:00`)
      .lt('processed_at', `${reconciliation.reconciliation_date}T23:59:59`);

    if (reconciliation.agency_id) {
      // Get payment IDs for this agency
      const paymentIds = payments?.map(p => p.infringement_id) || [];
      const { data: agencyPayments } = await supabase
        .from('payments')
        .select('id')
        .in('infringement_id', paymentIds);

      const agencyPaymentIds = agencyPayments?.map(p => p.id) || [];
      refundsQuery = refundsQuery.in('payment_id', agencyPaymentIds);
    }

    const { data: refunds, count: refundCount, error: refundsError } = await refundsQuery;

    if (refundsError) throw refundsError;

    const totalRefunds = refunds?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

    // Update reconciliation with calculated totals
    const { error: updateError } = await supabase
      .from('payment_reconciliations')
      .update({
        total_payments: totalPayments,
        total_refunds: totalRefunds,
        net_amount: totalPayments - totalRefunds,
        payment_count: paymentCount || 0,
        refund_count: refundCount || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reconciliation_id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      totals: {
        total_payments: totalPayments,
        total_refunds: totalRefunds,
        net_amount: totalPayments - totalRefunds,
        payment_count: paymentCount || 0,
        refund_count: refundCount || 0,
      },
    });
  } catch (error) {
    console.error('Error calculating reconciliation:', error);
    return NextResponse.json(
      { error: 'Failed to calculate reconciliation' },
      { status: 500 }
    );
  }
}
