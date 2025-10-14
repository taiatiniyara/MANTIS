# Payment Management Quick Start Guide

## Overview
Complete guide to using the MANTIS payment processing system.

## Prerequisites
- MANTIS web application running
- User with appropriate role (officer, agency_admin, or central_admin)
- Infringements created in the system
- Supabase connection established

## Payment Methods Supported
1. **Card** - Credit/debit card payments
2. **M-Paisa** - Mobile money (Mozambique)
3. **MyCash** - Mobile money (Mozambique)

## How to Process a Payment

### Method 1: From Infringement Detail View

1. **Navigate to Infringements**
   - Go to `/infringements` route
   - View list of all infringements

2. **Open Infringement Details**
   - Click on any infringement row
   - Detail modal will open

3. **Initiate Payment**
   - Look for the green "Pay Now" button
   - Button only appears for "issued" status infringements
   - Click "Pay Now"

4. **Select Payment Method**
   - Choose from Card, M-Paisa, or MyCash
   - Each method shows an icon and description

5. **Confirm Payment**
   - Review infringement details
   - Verify amount matches fine
   - Click "Process Payment" button

6. **Processing**
   - 2-second processing animation
   - Simulated payment gateway

7. **Success/Failure**
   - **Success (95% chance):**
     - Receipt number displayed (e.g., RCT-1736789012345)
     - Infringement status updated to "paid"
     - Detail dialog automatically closes
     - Infringement list refreshes
   
   - **Failure (5% chance):**
     - Error message displayed
     - Option to retry with same or different method
     - Infringement remains "issued"

### Method 2: From Payments Page

1. **Navigate to Payments**
   - Go to `/payments` route
   - View payment dashboard

2. **View Summary Statistics**
   - Total Revenue
   - Successful Payments count
   - Pending Payments count
   - Failed Payments count

3. **Filter Payments** (Optional)
   - Use search box for receipt/vehicle/infringement number
   - Filter by status: All/Success/Pending/Failed
   - Filter by method: All/Card/M-Paisa/MyCash

4. **Retry Failed Payment**
   - Find payment with "failed" status
   - Click "Retry" button in actions column
   - Payment processes automatically with same method
   - Status updates on success/failure

5. **View Payment Details**
   - Click "View" button on any payment
   - Modal shows:
     - Receipt number
     - Amount and method
     - Payment status
     - Related infringement details
     - Vehicle and offence information
   - Download receipt (placeholder)

## Payment Status Flow

```
Issued Infringement
        ↓
Create Payment (pending)
        ↓
Process Payment
        ↓
   ┌────┴────┐
   ↓         ↓
Success    Failed
   ↓         ↓
Paid      Retry?
```

## Receipt Number Format
- Format: `RCT-{timestamp}`
- Example: `RCT-1736789012345`
- Unique for each successful payment
- Stored in `receipt_number` field

## Payment Data Structure

### Payment Record
```typescript
{
  id: string                    // UUID
  infringement_id: string       // FK to infringement
  amount: number               // Payment amount
  method: 'card' | 'mpaisa' | 'mycash'
  provider_reference: string?  // Optional external ref
  status: 'pending' | 'success' | 'failed'
  receipt_number: string?      // Generated on success
  paid_by_user_id: string      // User who paid
  paid_at: timestamp?          // When payment succeeded
  created_at: timestamp
  updated_at: timestamp
}
```

### Related Data
Each payment includes:
- Infringement details (number, status, dates)
- Vehicle information (registration, make, model)
- Offence details (code, description, category)
- Officer information (name, agency)

## User Permissions

### Officers
- ✅ Can view payments in their agency
- ✅ Can process payments for their infringements
- ✅ Can retry failed payments
- ❌ Cannot view payments from other agencies

### Agency Admins
- ✅ Can view all payments in their agency
- ✅ Can process payments for any infringement in their agency
- ✅ Can retry failed payments
- ✅ Can view payment summary statistics
- ❌ Cannot view payments from other agencies

### Central Admins
- ✅ Can view ALL payments across all agencies
- ✅ Can process any payment
- ✅ Can retry any failed payment
- ✅ Can view complete payment statistics
- ✅ Full access to payment data

## Common Scenarios

### Scenario 1: Successful Payment
```
1. Officer issues infringement for $50
2. Citizen opens infringement detail
3. Clicks "Pay Now"
4. Selects "M-Paisa" payment method
5. Clicks "Process Payment"
6. 2s processing animation
7. ✓ Success! Receipt: RCT-1736789012345
8. Infringement marked as "paid"
9. Dialog closes automatically
```

### Scenario 2: Failed Payment with Retry
```
1. Payment processed with Card
2. ✗ Payment fails (5% chance)
3. User sees error message
4. Clicks "Retry"
5. Selects different method (M-Paisa)
6. Payment processes again
7. ✓ Success on retry
8. Receipt generated
```

### Scenario 3: Viewing Payment History
```
1. Navigate to Payments page
2. See summary: $1,250 total revenue
3. Filter by "success" status
4. Search for vehicle "ABC123"
5. Click "View" on specific payment
6. See complete payment details
7. Download receipt (future feature)
```

## Troubleshooting

### Payment Not Showing
**Problem:** Created infringement but no payment option

**Solutions:**
- Verify infringement status is "issued"
- Check RLS policies in Supabase
- Ensure user has correct role
- Refresh the page

### "Pay Now" Button Missing
**Problem:** Button not visible in infringement detail

**Conditions for button to show:**
- Infringement status must be "issued"
- User must be authenticated
- Infringement must have a fine amount

### Payment Failed
**Problem:** Payment keeps failing

**Actions:**
- Try different payment method
- Check network connection
- Verify amount matches fine
- Contact system administrator

### Cannot Retry Payment
**Problem:** Retry button disabled

**Reasons:**
- Payment already succeeded
- Payment is pending (processing)
- User lacks permissions
- Network issue

## Testing the System

### Test Scenario 1: Complete Payment Flow
```bash
1. Create test infringement
2. Set status to "issued"
3. Set fine amount to $50
4. Open infringement detail
5. Click "Pay Now"
6. Test each payment method:
   - Card
   - M-Paisa
   - MyCash
7. Verify receipt generation
8. Check infringement status = "paid"
```

### Test Scenario 2: Failed Payment Handling
```bash
1. Process multiple payments (need ~20 to hit 5% failure)
2. When payment fails:
   - Verify error message shows
   - Check status = "failed"
   - Test retry functionality
   - Confirm success on retry
```

### Test Scenario 3: Filtering & Search
```bash
1. Create 10+ payments with different:
   - Statuses (success/pending/failed)
   - Methods (card/mpaisa/mycash)
   - Vehicles
2. Test search by:
   - Receipt number
   - Vehicle registration
   - Infringement number
3. Test status filter
4. Test method filter
5. Verify result counts
```

## API Functions Reference

### getPayments(filters?)
Fetch list of payments with optional filtering
```typescript
const { data } = useQuery({
  queryKey: ['payments', { status: 'success' }],
  queryFn: () => getPayments({ status: 'success' })
})
```

### getPayment(id)
Fetch single payment with related data
```typescript
const payment = await getPayment('payment-uuid')
```

### processPayment(paymentId, method, providerRef?)
Process a payment through the gateway
```typescript
const result = await processPayment(
  'payment-uuid',
  'mpaisa',
  'MPISA-REF-123'
)
```

### retryPayment(paymentId)
Retry a failed payment
```typescript
const result = await retryPayment('payment-uuid')
```

### getPaymentSummary(filters?)
Get payment statistics
```typescript
const summary = await getPaymentSummary({
  agency_id: 'agency-uuid',
  start_date: '2025-01-01',
  end_date: '2025-01-31'
})
```

## Component Reference

### ProcessPaymentDialog
```tsx
<ProcessPaymentDialog
  infringement={infringementData}
  open={isOpen}
  onOpenChange={setIsOpen}
  onSuccess={() => {
    // Handle successful payment
    refetchInfringements()
  }}
/>
```

### PaymentsTable
```tsx
<PaymentsTable
  payments={paymentsData}
  onViewDetails={(payment) => showDetails(payment)}
  onRetry={(payment) => retryPayment(payment.id)}
/>
```

### PaymentDetailDialog
```tsx
<PaymentDetailDialog
  payment={selectedPayment}
  open={isDetailOpen}
  onOpenChange={setIsDetailOpen}
/>
```

## Database Queries

### Get All Payments for Agency
```sql
SELECT p.*, i.infringement_number, v.reg_number
FROM payments p
JOIN infringements i ON p.infringement_id = i.id
JOIN vehicles v ON i.vehicle_id = v.id
WHERE i.agency_id = 'agency-uuid'
ORDER BY p.created_at DESC;
```

### Get Payment Statistics
```sql
SELECT
  COUNT(*) as total_payments,
  SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as total_revenue,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_payments,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments
FROM payments
WHERE created_at >= '2025-01-01';
```

### Get Failed Payments Needing Retry
```sql
SELECT p.*, i.infringement_number, v.reg_number
FROM payments p
JOIN infringements i ON p.infringement_id = i.id
JOIN vehicles v ON i.vehicle_id = v.id
WHERE p.status = 'failed'
ORDER BY p.created_at DESC;
```

## Configuration

### Simulated Gateway Settings
- Success Rate: 95%
- Processing Delay: 2000ms (2 seconds)
- Receipt Format: `RCT-{timestamp}`

### Future Gateway Integration
When integrating real payment gateway:
1. Replace `processPayment` function
2. Add actual API calls to gateway
3. Handle real provider references
4. Implement webhook handlers
5. Add proper error codes
6. Update processing time

## Best Practices

### For Officers
1. Always verify vehicle details before issuing
2. Double-check fine amounts
3. Ensure GPS location is captured
4. Upload evidence photos when possible

### For Citizens
1. Keep receipt numbers for records
2. Take screenshot of successful payment
3. Report any payment issues immediately
4. Verify infringement details before paying

### For Administrators
1. Monitor failed payment rate
2. Review payment statistics regularly
3. Investigate repeated failures
4. Export payment reports for reconciliation

## Support

### Getting Help
- View implementation summary: `PAYMENT_IMPLEMENTATION_SUMMARY.md`
- Check API documentation: `src/lib/api/payments.ts`
- Review component code: `src/components/process-payment-dialog.tsx`
- See database schema: `schema.sql` (lines 133-180)

### Reporting Issues
1. Note the error message
2. Record the payment ID
3. Check browser console for errors
4. Verify network connection
5. Contact system administrator

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** Production Ready (with simulated gateway)
