# Quick Start Guide: Reports & Analytics

## Overview
The Reports & Analytics module helps you understand infringement patterns, track revenue, monitor officer performance, and identify geographic hotspots. This guide will help you get started quickly.

## Accessing Reports

1. Log in to the MANTIS web application
2. Navigate to **Reports** from the main menu
3. The reports dashboard will load with default data (all time, your agency)

**Required Permissions**: You must be an Agency Admin or Central Admin to access reports.

## Understanding the Dashboard

### Summary Statistics (Top Section)

Four key metrics are displayed as cards:

1. **Total Infringements**
   - Shows total count of infringements
   - Displays date range if filters applied
   - Includes all statuses (issued, paid, voided, disputed)

2. **Total Revenue**
   - Sum of all infringement amounts
   - Shows average fine per infringement
   - Includes pending and paid amounts

3. **Payment Rate**
   - Percentage of infringements that have been paid
   - Shows ratio (e.g., "450 of 600 paid")
   - Higher is better (target: >70%)

4. **Status Breakdown**
   - Quick overview of infringement statuses
   - Shows issued, voided, and disputed counts
   - Helps identify processing backlogs

## Using Filters

### Date Range Filter

**Quick Select Options**:
- **Last 7 Days** - Previous week's data
- **Last 30 Days** - Previous month's data
- **Last 90 Days** - Previous quarter's data
- **Year to Date** - From January 1 to today

**Custom Date Range**:
1. Click on the date filter card
2. Enter Start Date and End Date manually
3. Click outside to apply
4. Click "Clear" to remove filters

### Agency Filter (Central Admin Only)

If you're a Central Admin:
1. Use the agency dropdown next to date filter
2. Select "All Agencies" to view system-wide data
3. Select specific agency to focus on one agency

## Understanding the Reports

### 1. Offence Breakdown

**What It Shows**:
- Most common offences by volume
- Revenue generated per offence type
- Average fine amount per offence
- Percentage of total infringements

**How to Read**:
- **Count** - Number of times this offence was recorded
- **Total Revenue** - Sum of all fines for this offence
- **Avg Fine** - Average fine amount (helps spot anomalies)
- **% of Total** - Proportion of all infringements

**Use Cases**:
- Identify which offences are most common
- Find high-revenue offence categories
- Plan enforcement priorities
- Budget revenue forecasts

**Export**: Click "Export CSV" to download full offence data

### 2. Officer Performance

**What It Shows**:
- Individual officer productivity
- Revenue generated per officer
- Voided and disputed infringement counts
- Accuracy rate (lower voids/disputes = higher accuracy)

**How to Read**:
- **Total** - Number of infringements issued by officer
- **Revenue** - Total revenue from officer's infringements
- **Voided** - Infringements cancelled/voided
- **Disputed** - Infringements under dispute
- **Accuracy** - Percentage of infringements that remain valid
  - 🟢 Green (≥90%) - Excellent accuracy
  - 🟡 Yellow (≥75%) - Good accuracy
  - 🔴 Red (<75%) - Needs improvement

**Use Cases**:
- Identify high-performing officers
- Spot officers needing additional training
- Distribute recognition or coaching
- Monitor quality control

**Export**: Click "Export CSV" to download full officer data

### 3. Agency Performance (Central Admin Only)

**What It Shows**:
- Comparison across multiple agencies
- Total infringements and revenue per agency
- Payment collection rates by agency

**How to Read**:
- **Infringements** - Total count per agency
- **Revenue** - Total revenue generated
- **Payment Rate** - Percentage of infringements paid
  - 🟢 Green (≥70%) - Excellent collection
  - 🟡 Yellow (≥50%) - Moderate collection
  - 🔴 Red (<50%) - Low collection

**Use Cases**:
- Compare agency effectiveness
- Identify best practices from high-performers
- Support struggling agencies
- Allocate resources fairly

**Export**: Click "Export CSV" to download full agency data

### 4. Geographic Distribution & Interactive Map

**What It Shows**:
- **Interactive Google Maps heatmap** showing infringement density
- Color-coded intensity (green → yellow → orange → red)
- Cluster markers for high-density areas
- Top 5 locations table with infringement counts and revenue

**How to Read the Map**:
- **Green areas** - Low infringement activity (1-5 infringements)
- **Yellow areas** - Moderate activity (6-15 infringements)
- **Orange areas** - High activity (16-30 infringements)
- **Red areas** - Very high activity (30+ infringements)
- **Cluster numbers** - Number of infringements in that area
- **Individual markers** - Single infringement locations (at high zoom)

**Map Controls**:
- **Zoom +/-** - Adjust map detail level
- **Map/Satellite** - Toggle view type
- **Full Screen** - Expand map to full screen
- **My Location** - Center on your current location

**Interacting with the Map**:
1. **Pan** - Click and drag to move around
2. **Zoom** - Use scroll wheel or +/- buttons
3. **Click Cluster** - Zoom into that area to see individual markers
4. **Click Marker** - View infringement details
5. **Filter by Area** - Pan to area of interest, click "Filter by Visible Area" button

**Table View**:
- Locations listed in order of activity (highest first)
- Shows both volume and revenue impact
- Helps identify enforcement hotspots

**Use Cases**:
- **Visual hotspot identification** - Quickly see problem areas
- Deploy officers to high-activity areas
- Plan traffic calming measures
- **Route planning** - Click "Get Directions" to navigate to hotspot
- **Area analysis** - Filter reports by geographic region
- **Trend analysis** - Compare heatmap over different time periods
- Identify dangerous locations
- Optimize patrol routes

**Note**: Interactive heatmap visualization coming in Phase 3

## Exporting Data

### Individual Section Exports

Each report section has its own "Export CSV" button:
1. Click the export button in section header
2. CSV file downloads automatically
3. Open in Excel, Google Sheets, or any spreadsheet app
4. Filename includes report type and timestamp

### Export Summary Statistics

Bottom of page has "Export Summary" button:
1. Downloads high-level statistics as CSV
2. Useful for monthly reports or presentations
3. Single-row format for easy copy-paste

### CSV Format

All exports include:
- Column headers in first row
- UTF-8 encoding (supports special characters)
- Proper quote escaping (handles commas in text)
- Compatible with Excel, Google Sheets, Numbers

## Common Workflows

### Monthly Performance Review

1. Set date filter to "Last 30 Days"
2. Review summary statistics
3. Check officer performance table
4. Export officer data for records
5. Share results with team

### Quarterly Agency Report

1. Set date filter to "Last 90 Days"
2. Export summary statistics
3. Export offence breakdown
4. Export officer performance
5. Compile into presentation or report

### Real-Time Monitoring

1. Use default filters (all time, your agency)
2. Check payment rate regularly
3. Monitor voided count in officer performance
4. Address issues as they arise

### Central Admin Monthly Review

1. Select "All Agencies" from agency filter
2. Set date filter to previous month
3. Review agency performance table
4. Identify outliers (high/low performers)
5. Schedule follow-ups with agencies

## Tips & Best Practices

### Data Accuracy

- **Filters persist** - Remember to clear filters when done
- **Refresh data** - Page auto-refreshes every 5 minutes
- **Date ranges** - Be specific to avoid misleading comparisons
- **Manual refresh** - Reload page to force immediate data update

### Performance Optimization

- **Use date filters** - Reduces data load for large agencies
- **Top 10 limit** - Only shows top results by default
- **Export full data** - CSV contains all records, not just top 10

### Common Issues

**"No data available"**:
- Check date filters (may be too restrictive)
- Verify permissions (must be admin)
- Ensure infringements exist for selected period

**Export button disabled**:
- Wait for data to load (spinner visible)
- Check that data exists for export
- Verify browser allows downloads

**Accuracy rates seem low**:
- Review disputed infringements in detail
- Check for systematic errors
- Provide training to officers with low rates

## Interpreting Trends

### Payment Rate Trends

- **Target**: 70% or higher
- **Below 50%**: Investigate collection processes
- **Sudden drop**: Check for system issues or policy changes
- **Gradual decline**: May need reminder campaigns

### Offence Distribution

- **Concentrated** (one offence dominates): Targeted enforcement
- **Distributed** (many offences): General patrol
- **Seasonal patterns**: Weather, events, construction

### Officer Accuracy

- **New officers**: Lower accuracy expected (training period)
- **Experienced officers**: Should be >85%
- **Sudden decline**: May indicate burnout or equipment issues

## Getting Help

### Support Resources

- **Technical Issues**: Contact system administrator
- **Data Questions**: Review this guide or REPORTS_IMPLEMENTATION_SUMMARY.md
- **Training**: Request session from central admin
- **Feature Requests**: Submit via feedback channel

### FAQ

**Q: Can I see historical trends over time?**
A: Phase 3 will add interactive charts. Currently, export data and use Excel.

**Q: Why can't I filter by officer?**
A: Officer filter is planned for Phase 3. Use CSV export and filter in Excel.

**Q: How often is data updated?**
A: Real-time. React Query caches for 5 minutes for performance.

**Q: Can I schedule automatic reports?**
A: Not yet. Scheduled email reports coming in Phase 3.

**Q: What does "accuracy rate" mean?**
A: Percentage of infringements that were not voided or disputed. Higher is better.

## Next Steps

After mastering basic reports:

1. **Phase 3 Features** (Coming Soon):
   - Interactive charts and graphs
   - Interactive map with heatmap
   - Advanced filtering (officer, location, category)
   - Scheduled email reports

2. **Advanced Analysis**:
   - Export to Excel for pivot tables
   - Combine multiple months for trends
   - Compare year-over-year performance

3. **Team Training**:
   - Share this guide with team members
   - Schedule regular report reviews
   - Establish KPIs based on report data

## Conclusion

The Reports & Analytics module provides powerful insights into your enforcement operations. Regular review of these reports helps improve efficiency, identify issues early, and make data-driven decisions.

**Remember**: Reports are only valuable if you act on the insights they provide!

---

**Version**: 1.0  
**Last Updated**: October 13, 2025  
**Phase**: 2 (Complete)
