import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    
    const { id } = params;

    // Get payment details with infringement info
    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        infringement:infringements(
          infringement_number,
          offender_name,
          offender_license,
          vehicle_registration,
          type:infringement_types(name, fine_amount),
          agency:agencies(name, contact_email, contact_phone)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Generate PDF receipt
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .receipt-number { font-size: 24px; font-weight: bold; color: #333; }
          .details { margin: 20px 0; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; }
          .total { font-size: 20px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Payment Receipt</h1>
          <div class="receipt-number">${payment.receipt_number}</div>
        </div>
        
        <div class="details">
          <div class="row">
            <span class="label">Payment Reference:</span>
            <span>${payment.payment_reference}</span>
          </div>
          <div class="row">
            <span class="label">Infringement Number:</span>
            <span>${payment.infringement?.[0]?.infringement_number || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Offender Name:</span>
            <span>${payment.infringement?.[0]?.offender_name || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">License Number:</span>
            <span>${payment.infringement?.[0]?.offender_license || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Vehicle Registration:</span>
            <span>${payment.infringement?.[0]?.vehicle_registration || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Infringement Type:</span>
            <span>${payment.infringement?.[0]?.type?.[0]?.name || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Payment Method:</span>
            <span>${payment.payment_method.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div class="row">
            <span class="label">Payment Date:</span>
            <span>${payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Transaction ID:</span>
            <span>${payment.transaction_id || 'N/A'}</span>
          </div>
        </div>
        
        <div class="total">
          <div class="row">
            <span>TOTAL PAID:</span>
            <span>$${payment.amount.toFixed(2)} ${payment.currency}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an official receipt for payment of traffic infringement.</p>
          <p>For inquiries, please contact: ${payment.infringement?.[0]?.agency?.[0]?.contact_email || 'N/A'}</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    // In production, use a library like puppeteer or @react-pdf/renderer
    // For now, return HTML that can be converted to PDF on client
    return new NextResponse(receiptHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="receipt-${payment.receipt_number}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    );
  }
}
