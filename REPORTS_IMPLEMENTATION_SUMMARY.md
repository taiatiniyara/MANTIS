# Reports & Analytics Implementation Summary

## Overview
The Reports & Analytics module provides comprehensive data analysis and visualization capabilities for the MANTIS system. It enables agency administrators and central administrators to gain insights into infringement patterns, revenue trends, officer performance, and geographic distribution.

## Components Created

### 1. Reports API Layer (`src/lib/api/reports.ts`)
**Purpose**: Centralized API functions for fetching analytics data

**Functions**:
- `getInfringementStats(filters)` - Aggregate statistics (total, revenue, payment rate, status breakdown)
- `getRevenueByPeriod(filters, groupBy)` - Time-series revenue data (day/week/month grouping)
- `getOffenceBreakdown(filters)` - Offence statistics with percentages
- `getAgencyPerformance(filters)` - Multi-agency comparison metrics
- `getGeographicData(filters)` - Location clustering for heatmaps (coordinates rounded to 4 decimals)
- `getTemporalTrends(filters, groupBy)` - Time-series combining infringements and payments
- `getOfficerPerformance(filters)` - Officer productivity and accuracy metrics
- `exportToCSV(data, filename)` - Generic CSV export with proper escaping

**Key Features**:
- Type-safe with TypeScript interfaces
- Handles null values gracefully
- Supports filtering by date range, agency, and status
- Calculates percentages and rates automatically
- Geographic data clustering for performance

### 2. Statistics Card Component (`src/components/statistics-card.tsx`)
**Purpose**: Reusable KPI card for displaying key metrics

**Props**:
- `title` - Card title (e.g., "Total Revenue")
- `value` - Main metric value (e.g., "1,234")
- `subtitle` - Additional context (e.g., "Last 30 days")
- `icon` - Lucide icon component
- `iconColor` - Tailwind color class for icon
- `trend` - Optional trend object with `value` and `direction`

**Features**:
- Clean, modern design with icon
- Optional trend indicator (↑/↓ with percentage)
- Dark mode support
- Responsive layout

### 3. Date Range Filter Component (`src/components/date-range-filter.tsx`)
**Purpose**: Date range selection with quick filters

**Props**:
- `startDate` / `endDate` - Current date values
- `onStartDateChange` / `onEndDateChange` - Callbacks for date changes
- `onClear` - Callback to reset filters

**Quick Select Buttons**:
- Last 7 days
- Last 30 days
- Last 90 days
- Year to Date (YTD)

**Features**:
- Collapsible UI (expands on click)
- Shows active filter indicator
- Custom date inputs for precise ranges
- Calculates relative dates automatically

### 4. Reports Page (`src/routes/reports.tsx`)
**Purpose**: Main analytics dashboard with multiple report sections

**Sections**:

#### Summary Statistics
Four key metrics displayed as cards:
- Total Infringements
- Total Revenue (with average fine)
- Payment Rate (percentage paid)
- Status Breakdown (issued, voided, disputed)

#### Offence Breakdown Table
- Top 10 offences by volume
- Columns: Code, Description, Category, Count, Revenue, Avg Fine, % of Total
- Sortable and exportable to CSV
- Shows total count at bottom

#### Officer Performance Table
- Individual officer statistics
- Columns: Officer Name, Total, Revenue, Voided, Disputed, Accuracy
- Color-coded accuracy rates:
  - Green ≥90% (excellent)
  - Yellow ≥75% (good)
  - Red <75% (needs improvement)
- Exportable to CSV

#### Agency Performance Table (Central Admin Only)
- Comparison across agencies
- Columns: Agency Name, Infringements, Revenue, Payment Rate
- Color-coded payment rates
- Exportable to CSV

#### Geographic Distribution
- Shows top 5 hotspots in table format
- Displays infringement count and revenue per location
- **Interactive Google Maps heatmap** with color-coded density visualization
- Marker clustering for high-density areas
- Click-to-zoom on hotspots
- Filter infringements by map viewport

## Data Flow

```
User Input (Filters) → React Query → API Functions → Supabase → PostgreSQL
                                                              ↓
                                                         Process Data
                                                              ↓
                                                    Calculate Aggregates
                                                              ↓
UI Components ← React State ← React Query Cache ← JSON Response
```

## Filter System

**Available Filters**:
1. **Date Range** - Start and end dates
2. **Agency** - Specific agency (central admin only)
3. **Status** - Infringement status (future enhancement)

**Filter Application**:
- Filters are applied to all queries simultaneously
- React Query automatically refetches when filters change
- Empty filters return all data (agency filter respects user permissions)

## Permission Handling

**Agency Admin**:
- Can only see data for their own agency
- Agency filter is automatically applied based on `user_profiles.agency_id`
- Cannot access agency comparison data

**Central Admin**:
- Can see data across all agencies
- Can filter by specific agency or view all
- Has access to agency performance comparison

## Export Functionality

**CSV Export Features**:
- Proper quote escaping for special characters
- Handles null/undefined values gracefully
- UTF-8 encoding with BOM for Excel compatibility
- Automatic filename with timestamp
- Toast notification on successful export

**Available Exports**:
1. Summary Statistics (single row)
2. Offence Breakdown (multiple rows)
3. Officer Performance (multiple rows)
4. Agency Performance (multiple rows, central admin only)

## Performance Considerations

### Optimization Strategies

1. **Geographic Data Clustering**
   - Coordinates rounded to 4 decimal places (~11m precision)
   - Reduces data points significantly
   - Improves heatmap rendering performance

2. **React Query Caching**
   - Default 5-minute cache time
   - Prevents unnecessary API calls
   - Automatic background refetching

3. **Table Pagination**
   - Top 10 results displayed by default
   - Shows total count below table
   - Reduces initial render time

4. **Conditional Queries**
   - Agency performance query only runs for central admins
   - Saves unnecessary API calls

### Database Query Optimization

All queries use PostgreSQL aggregation functions:
- `COUNT()` for totals
- `SUM()` for revenue
- `AVG()` for averages
- `GROUP BY` for breakdowns
- Proper indexes on foreign keys and date columns

## Error Handling

**API Errors**:
- React Query automatically retries failed requests (3 times)
- Error boundaries prevent full page crashes
- Toast notifications for user feedback

**Empty States**:
- Friendly messages when no data available
- Icon-based empty states for visual clarity
- Helpful context (e.g., "Try adjusting filters")

**Loading States**:
- Spinner animation during data fetch
- Disabled export buttons while loading
- Prevents duplicate requests

## Google Maps Integration

### Components

**InfringementHeatmap Component** (`src/components/maps/infringement-heatmap.tsx`)

**Features:**
- Displays geographic data from `getGeographicData()` API
- Heatmap layer with customizable gradient (green → yellow → orange → red)
- Marker clustering using `@googlemaps/markerclusterer`
- Info windows showing infringement count and revenue per location
- Responsive sizing (full-width on mobile, embedded in dashboard on desktop)
- Loading skeleton while data fetches

**Props:**
- `infringements` - Array of infringement objects with location data
- `center` - Initial map center (default: Fiji coordinates)
- `zoom` - Initial zoom level (default: 10)
- `onMarkerClick` - Callback when marker is clicked

**Implementation:**
```typescript
import { GoogleMap, HeatmapLayer, MarkerClusterer } from '@react-google-maps/api';

// Heatmap gradient matching MANTIS theme
const heatmapGradient = [
  'rgba(16, 185, 129, 0)',    // Green transparent
  'rgba(16, 185, 129, 0.6)',  // Green
  'rgba(251, 191, 36, 0.8)',  // Yellow
  'rgba(249, 115, 22, 0.9)',  // Orange
  'rgba(220, 38, 38, 1)'      // Red
];
```

**Map Controls:**
- Zoom in/out buttons
- Full-screen toggle
- Map/Satellite view switcher
- Reset to default view button
- Draw polygon filter (advanced)

**Performance:**
- Coordinate clustering at 4 decimal precision (~11m)
- Viewport-based data loading (only fetch visible area)
- Debounced map move events (500ms)
- Maximum 500 markers rendered at once

### Usage in Reports Dashboard

**Placement:** Below Officer Performance table, above export buttons

**Layout:**
- Desktop: 100% width, 500px height, side-by-side with statistics
- Tablet: 100% width, 400px height, stacked below tables
- Mobile: 100% width, 350px height, collapsible section

**Interaction Flow:**
1. Map loads with all infringements in current filter
2. User pans/zooms to area of interest
3. Clusters expand into individual markers at zoom 16+
4. Click marker to see infringement details
5. Click "Filter by Map Area" to update all reports
6. Click "Reset Map" to clear geographic filter

### API Integration

**getGeographicData() Response:**
```typescript
{
  location: {
    lat: number,
    lng: number
  },
  count: number,
  revenue: number,
  address?: string  // Cached from geocoding
}
```

**PostGIS Query:**
```sql
SELECT 
  ROUND(ST_Y(location::geometry)::numeric, 4) as lat,
  ROUND(ST_X(location::geometry)::numeric, 4) as lng,
  COUNT(*) as count,
  SUM(fine_amount) as revenue
FROM infringements
WHERE status != 'voided'
  AND issued_at BETWEEN $1 AND $2
  AND ($3::uuid IS NULL OR issuing_agency_id = $3)
GROUP BY lat, lng
HAVING COUNT(*) >= 3  -- Minimum 3 infringements to show
ORDER BY count DESC;
```

## Future Enhancements

### Phase 3 Additions
1. **Interactive Charts**
   - Line charts for temporal trends
   - Bar charts for offence comparison
   - Pie charts for status breakdown

2. **Enhanced Map Features**
   - Street view integration
   - Custom polygon drawing for area analysis
   - Time-lapse animation showing infringement patterns over time
   - Export map as high-resolution image
   - Print-friendly map view for reports

3. **Advanced Filters**
   - Officer filter
   - Location radius filter (within X km of point)
   - Multiple offence categories
   - Custom date ranges (last X days)
   - Weather conditions (future data integration)

4. **Scheduled Reports**
   - Email reports on schedule
   - PDF export with charts
   - Automatic report generation

5. **Predictive Analytics**
   - ML-based trend forecasting
   - Anomaly detection
   - Risk scoring

## Technical Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.90.2",
    "@tanstack/react-router": "^1.132.47",
    "@supabase/supabase-js": "^2.49.2",
    "date-fns": "^1.x",
    "lucide-react": "latest",
    "sonner": "latest"
  }
}
```

## Database Schema Dependencies

**Tables Used**:
- `infringements` - Main transaction table
- `payments` - Payment records
- `offences` - Offence definitions
- `user_profiles` - Officer and admin data
- `agencies` - Agency information

**Key Columns**:
- `infringements.status` - For status breakdown
- `infringements.amount` - For revenue calculations
- `infringements.location` - For geographic analysis
- `infringements.issued_at` - For temporal analysis
- `payments.status` - For payment rate calculation

## Testing Recommendations

### Unit Tests
- Test each API function with mock data
- Test date range calculations
- Test CSV export formatting
- Test filter combinations

### Integration Tests
- Test full data flow from UI to database
- Test permission enforcement
- Test export downloads
- Test React Query cache behavior

### E2E Tests
- Test complete user workflows
- Test filter interactions
- Test export functionality
- Test responsive behavior

## Deployment Notes

1. **Environment Variables**
   - Ensure Supabase URL and key are configured
   - No additional environment variables needed

2. **Database Migrations**
   - No schema changes required
   - All existing tables and columns used

3. **Performance Monitoring**
   - Monitor query execution times
   - Watch for slow geographic queries
   - Track React Query cache hit rates

4. **User Training**
   - Provide documentation on filter usage
   - Explain accuracy rate calculations
   - Document CSV export format

## Conclusion

The Reports & Analytics module provides a solid foundation for data-driven decision making in the MANTIS system. The modular architecture allows for easy extension with additional reports and visualizations in future phases.

**Key Achievements**:
- ✅ Comprehensive statistics across 6 dimensions
- ✅ Flexible filtering system
- ✅ Role-based access control
- ✅ Export functionality for all reports
- ✅ Performance-optimized queries
- ✅ Responsive, accessible UI

**Phase 2 Status**: Complete (100%)
