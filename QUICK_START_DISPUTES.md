# Dispute Management Quick Start Guide

## Overview
Complete guide to using the MANTIS dispute management system for reviewing and resolving citizen disputes.

## Prerequisites
- MANTIS web application running
- User with appropriate role (officer, agency_admin, or central_admin)
- Infringements created in the system
- Supabase connection established

## Dispute Statuses
1. **Open** ⚠️ - Awaiting agency admin review
2. **Resolved** ✓ - Decision made (approved or rejected)
3. **Escalated** ↑ - Sent to higher authority for review

## How to File a Dispute (Citizen/Officer)

### From Infringement Detail View

1. **Navigate to Infringements**
   - Go to `/infringements` route
   - View list of all infringements

2. **Open Infringement Details**
   - Click on any infringement row
   - Detail modal will open

3. **Mark as Disputed**
   - Click "Mark as Disputed" button (yellow button)
   - Enter dispute reason in the text area
   - Click "Mark as Disputed" to confirm

4. **Result**
   - Dispute record created
   - Infringement status changed to "disputed"
   - Dispute appears in admin queue
   - Confirmation toast notification

## How to Resolve a Dispute (Agency Admin)

### Method 1: From Disputes Page

1. **Navigate to Disputes**
   - Go to `/disputes` route
   - View dispute management dashboard

2. **Review Summary Statistics**
   - Total Disputes count
   - Open Disputes (backlog)
   - Resolved Disputes (completed)
   - Average Resolution Time

3. **Find Dispute to Resolve**
   - Use search box to filter by:
     - Infringement number
     - Vehicle registration
     - Citizen name
     - Dispute reason text
   - Use status filter: Open/Resolved/Escalated
   - Browse dispute queue table

4. **View Dispute Details** (Optional)
   - Click "View" button on dispute row
   - Review complete dispute information:
     - Dispute reason
     - Citizen information
     - Related infringement details
     - Vehicle and offence information
     - Timeline
   - Close detail dialog

5. **Resolve Dispute**
   - Click "Resolve" button on open dispute
   - Resolution dialog opens

6. **Choose Resolution Action**
   
   **Option A: Approve (Void Infringement)**
   - Review dispute details
   - Enter resolution notes (required)
   - Click green "Approve" button
   - Infringement is voided
   - Citizen wins dispute
   
   **Option B: Reject (Keep Infringement)**
   - Review dispute details
   - Enter resolution notes (required)
   - Click red "Reject" button
   - Infringement remains issued
   - Citizen must pay fine
   
   **Option C: Escalate (Higher Authority)**
   - Review dispute details
   - Enter escalation notes (required)
   - Click orange "Escalate" button
   - Dispute sent to higher authority
   - Requires senior decision

7. **Confirmation**
   - Success toast notification
   - Dispute list automatically refreshes
   - Resolution dialog closes
   - Statistics update

## Dispute Resolution Flow

```
Issued Infringement
        ↓
Citizen Files Dispute
        ↓
Status: Open (⚠️)
        ↓
Admin Reviews
        ↓
    Choose Action
        ↓
   ┌────┴────┬────────┐
   ↓         ↓        ↓
Approve   Reject   Escalate
   ↓         ↓        ↓
Void    Reissue   Higher
        ↓         Auth
Status:   Status:
Resolved  Resolved  Escalated
   (✓)      (✓)       (↑)
```

## Resolution Actions Explained

### Approve Dispute
**When to Use:**
- Infringement was issued in error
- Evidence supports citizen's claim
- Technical issue with infringement
- Officer made a mistake

**Effects:**
- Infringement status: `issued` → `voided`
- Dispute status: `open` → `resolved`
- Citizen no longer owes fine
- Resolution notes recorded

**Example Scenarios:**
- Wrong vehicle registration recorded
- Incorrect offence code
- Valid parking permit not noticed
- GPS location incorrect

### Reject Dispute
**When to Use:**
- Dispute lacks merit
- Evidence supports infringement
- Citizen's reason is insufficient
- Infringement is valid

**Effects:**
- Infringement status: `disputed` → `issued`
- Dispute status: `open` → `resolved`
- Citizen must pay fine
- Resolution notes recorded

**Example Scenarios:**
- No evidence provided
- Claim contradicts facts
- Valid infringement, no error
- Citizen admits violation

### Escalate Dispute
**When to Use:**
- Complex legal question
- Requires senior decision
- Policy interpretation needed
- High-value dispute
- Uncertain about decision

**Effects:**
- Infringement status: remains `disputed`
- Dispute status: `open` → `escalated`
- Sent to higher authority
- Escalation notes recorded

**Example Scenarios:**
- Legal precedent question
- High-profile case
- Large fine amount
- Policy ambiguity
- Requires expert review

## Best Practices

### For Agency Admins

#### Resolution Notes Guidelines
1. **Be Specific**: Reference exact facts and evidence
2. **Be Professional**: Use formal, respectful language
3. **Be Thorough**: Explain reasoning completely
4. **Be Objective**: Base decision on facts, not opinions
5. **Be Clear**: Avoid ambiguous language

#### Good Resolution Note Examples

**Approve:**
```
After reviewing the evidence, the vehicle registration was incorrectly 
recorded as ABC123 when it should have been ABC132. Officer confirmed 
the error. Dispute approved, infringement voided.
```

**Reject:**
```
Citizen claims they were not driving, but evidence shows their vehicle 
at the location at the specified time. No other driver identified. 
Vehicle owner is responsible. Dispute rejected.
```

**Escalate:**
```
This case involves a complex question about parking permit validity 
during public holidays. Legal interpretation required. Escalating to 
senior administrator for policy guidance.
```

### For Citizens Filing Disputes

#### Effective Dispute Reasons
1. **Be Factual**: Provide specific facts, not opinions
2. **Be Detailed**: Include all relevant information
3. **Be Respectful**: Professional tone helps
4. **Provide Evidence**: Mention any supporting documentation
5. **Be Honest**: Don't fabricate claims

#### Good Dispute Examples

**Valid Dispute:**
```
I was not the driver of this vehicle on the specified date. The vehicle 
was borrowed by my brother. I can provide his driver's licence and a 
signed statement. Vehicle was parked at home address during the time 
shown on infringement.
```

**Valid Dispute:**
```
I had a valid parking permit displayed on my dashboard (permit #12345). 
The permit was clearly visible from outside. I have photos showing the 
permit in place. Officer may not have seen it due to window tint.
```

## Dashboard Features

### Summary Cards

1. **Total Disputes**
   - Shows all-time dispute count
   - Helps track dispute volume
   - Historical metric

2. **Open Disputes**
   - Current backlog requiring attention
   - Priority metric for admins
   - Target: Keep below threshold

3. **Resolved Disputes**
   - Completed disputes count
   - Measures throughput
   - Shows productivity

4. **Average Resolution Time**
   - Hours to resolve disputes
   - Efficiency metric
   - Target: < 48 hours
   - Shows N/A if no resolved disputes

### Filtering Options

**Search Bar:**
- Infringement number
- Vehicle registration
- Citizen name
- Dispute reason text
- Real-time filtering

**Status Filter:**
- All Status (default)
- Open - Awaiting review
- Resolved - Completed
- Escalated - Sent to higher authority

### Disputes Table

**Columns:**
- Infringement: Number and fine amount
- Vehicle: Registration and make/model
- Citizen: Name and email
- Reason: Truncated dispute text
- Status: Visual indicator
- Created: Date and time
- Actions: View, Resolve (if open)

**Interactions:**
- Click "View" to see full details
- Click "Resolve" to start resolution process
- Hover for additional information

## Common Scenarios

### Scenario 1: Quick Resolution (Approve)
```
1. Admin reviews dispute in queue
2. Dispute reason clearly shows error
3. Admin clicks "Resolve"
4. Enters notes: "Officer confirmed wrong vehicle"
5. Clicks "Approve" button
6. Infringement voided automatically
7. Citizen notified (future feature)
8. 2 minutes total
```

### Scenario 2: Detailed Review (Reject)
```
1. Admin clicks "View" on dispute
2. Reviews all details:
   - Dispute reason
   - Infringement information
   - Vehicle details
   - Officer notes
3. Closes detail view
4. Clicks "Resolve"
5. Enters comprehensive notes
6. Clicks "Reject" button
7. Infringement remains issued
8. 5 minutes total
```

### Scenario 3: Escalation
```
1. Admin reviews complex dispute
2. Legal question identified
3. Clicks "Resolve"
4. Enters escalation notes with context
5. Clicks "Escalate" button
6. Senior admin receives notification
7. Status tracked as escalated
8. Follows up later
```

## Troubleshooting

### Cannot Resolve Dispute
**Problem:** Resolve button is disabled or missing

**Causes:**
- Dispute status is not "open"
- User lacks admin permissions
- Dispute already resolved
- Network connection issue

**Solutions:**
- Check dispute status filter
- Verify admin role
- Refresh the page
- Check network connection

### Resolution Notes Required
**Problem:** Cannot submit resolution without notes

**Reason:**
- System requires documentation
- Audit trail compliance
- Quality assurance

**Solution:**
- Always enter detailed notes
- Explain reasoning clearly
- Provide factual basis

### Statistics Not Loading
**Problem:** Summary cards show 0 or N/A

**Causes:**
- No disputes in database
- Filter applied (agency-specific)
- Network issue

**Solutions:**
- Create test disputes
- Check filter settings
- Verify network connection

## Permissions & Access

### Officers
- ✅ Can view disputes in their agency
- ✅ Can file disputes (mark infringements as disputed)
- ❌ Cannot resolve disputes (admin only)
- ❌ Cannot view other agencies' disputes

### Agency Admins
- ✅ Can view all disputes in their agency
- ✅ Can resolve disputes in their agency
- ✅ Can escalate disputes
- ✅ Can view dispute statistics for their agency
- ❌ Cannot view other agencies' disputes

### Central Admins
- ✅ Can view ALL disputes across all agencies
- ✅ Can resolve any dispute
- ✅ Can escalate any dispute
- ✅ Can view complete system statistics
- ✅ Full access to dispute system

## Metrics & KPIs

### Track These Metrics

1. **Open Disputes Count**
   - Target: < 10 per agency
   - Monitor daily
   - Indicates backlog

2. **Resolution Time**
   - Target: < 48 hours
   - Average across all disputes
   - Efficiency metric

3. **Approval Rate**
   - Target: 20-30%
   - Too high: Quality issues
   - Too low: Customer service issues

4. **Escalation Rate**
   - Target: < 10%
   - Indicates complex cases
   - May need training

## API Functions Reference

### getDisputes(filters?)
Fetch list of disputes with filtering
```typescript
const { data } = useQuery({
  queryKey: ['disputes', { status: 'open' }],
  queryFn: () => getDisputes({ status: 'open' })
})
```

### getDispute(id)
Fetch single dispute with all related data
```typescript
const dispute = await getDispute('dispute-uuid')
```

### resolveDispute(input)
Resolve a dispute (approve or reject)
```typescript
const result = await resolveDispute({
  dispute_id: 'dispute-uuid',
  resolution_notes: 'Detailed explanation...',
  approve: true // true = void, false = keep
})
```

### escalateDispute(disputeId, notes)
Escalate dispute to higher authority
```typescript
const result = await escalateDispute(
  'dispute-uuid',
  'Escalation reason...'
)
```

### getDisputeSummary(filters?)
Get dispute statistics
```typescript
const summary = await getDisputeSummary({
  agency_id: 'agency-uuid'
})
```

## Database Queries

### Get Open Disputes for Agency
```sql
SELECT d.*, i.infringement_number, v.reg_number
FROM disputes d
JOIN infringements i ON d.infringement_id = i.id
JOIN vehicles v ON i.vehicle_id = v.id
WHERE d.status = 'open'
  AND i.agency_id = 'agency-uuid'
ORDER BY d.created_at ASC;
```

### Get Dispute Statistics
```sql
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
  COUNT(CASE WHEN status = 'escalated' THEN 1 END) as escalated
FROM disputes d
JOIN infringements i ON d.infringement_id = i.id
WHERE i.agency_id = 'agency-uuid';
```

### Calculate Average Resolution Time
```sql
SELECT AVG(
  EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
) as avg_hours
FROM disputes
WHERE status = 'resolved'
  AND resolved_at IS NOT NULL;
```

## Testing Checklist

### Functional Testing
- [ ] File dispute from infringement detail
- [ ] View dispute in queue
- [ ] Filter by status
- [ ] Search by various fields
- [ ] View dispute details
- [ ] Approve dispute (check infringement voided)
- [ ] Reject dispute (check infringement issued)
- [ ] Escalate dispute (check status)
- [ ] Verify statistics update
- [ ] Test with different user roles

### Edge Cases
- [ ] Empty resolution notes
- [ ] Resolving already resolved dispute
- [ ] Very long dispute reasons
- [ ] Special characters in text
- [ ] Multiple simultaneous resolutions
- [ ] Network failure during resolution

## Support

### Getting Help
- View implementation summary: `DISPUTE_IMPLEMENTATION_SUMMARY.md`
- Check API documentation: `src/lib/api/disputes.ts`
- Review component code: `src/components/resolve-dispute-dialog.tsx`
- See database schema: `schema.sql` (lines 163-185)

### Reporting Issues
1. Note the error message
2. Record the dispute ID
3. Check browser console for errors
4. Verify network connection
5. Contact system administrator

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** Production Ready
