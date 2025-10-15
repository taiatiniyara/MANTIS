# 🎨 MANTIS UI Specifications

## 1. Theme
- **Primary Palette**: Blue (trust, authority, clarity)
- **Neutral Palette**: Zinc (professional, balanced, neutral backgrounds)
- **Mode**: Light mode only (no dark mode toggle)
- **Accent Colors**: Use lighter/darker shades of blue for emphasis (hover states, active states)

---

## 2. Web App (Next.js + shadcn/ui)

### Framework
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) (Radix + Tailwind)
- **Styling**: Tailwind CSS with custom theme tokens

### Theme Tokens
```ts
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#2563eb', // blue-600
        foreground: '#ffffff',
      },
      neutral: {
        DEFAULT: '#71717a', // zinc-500
        foreground: '#000000',
      },
    },
  },
}
```

### Components
- **Navigation**: Top bar with agency logo, user role, and quick links
- **Sidebar**: For admin dashboards (teams, routes, infringements)
- **Forms**: Use shadcn/ui `Form`, `Input`, `Select`, `Button`
- **Tables**: Use shadcn/ui `Table` with zebra striping in zinc shades
- **Cards**: For summary stats (total infringements, fines by GL code)

### Typography
- **Font**: Inter or Source Sans Pro
- **Scale**:
  - H1: 28–32px, bold
  - H2: 22–24px, semibold
  - Body: 16px, regular
  - Small: 14px, medium
- **Line height**: 1.5
- **Color**: Zinc‑800 for body, Blue‑600 for headings/links

---

## 3. Mobile App (React Native/Expo)

### Framework
- **UI**: Plain React Native components (with optional React Native Paper if desired)
- **Theme**: Mirror web palette (blue primary, zinc neutral)

### Components
- **Navigation**: Bottom tab bar (Home, Record, Reports, Profile)
- **Forms**: 
  - Dropdowns for infringement category → type
  - Text inputs for notes and vehicle details
  - Date/time picker for issued_at
- **Cards**: For infringement summaries and quick stats
- **Buttons**: Rounded, blue background, white text

### Typography
- **Font**: System default (iOS San Francisco, Android Roboto) or Inter via Expo Google Fonts
- **Scale**:
  - Title: 24px, semibold
  - Subtitle: 18px, medium
  - Body: 16px, regular
  - Caption: 14px, medium
- **Color**: Zinc‑900 for text, Blue‑600 for emphasis

---

## 4. Accessibility & UX
- **Contrast**: WCAG AA compliant (blue on white, zinc on white)
- **Touch Targets**: Minimum 44px height for buttons
- **Consistency**: Same category/type dropdown structure across web and mobile
- **Feedback**: Blue highlights for active states, zinc for disabled states

---

## 5. Visual Identity
- **Look & Feel**: Professional, authoritative, approachable
- **No Dark Mode**: Light mode only
- **Typography System**: Clean, modern, legible — conveys trust and clarity
```


---

## 6. Reusable Components Strategy

### 6.1 Web App Components (`web/components/`)

**Purpose**: Keep code minimal and maintainable by building a library of reusable, composable components.

#### Core Components
- **`InfringementCard`**: Display infringement summary with category, type, fine amount, status
- **`StatCard`**: Show metrics like total fines, infringements by category
- **`DataTable`**: Reusable table with sorting, filtering, and pagination for infringement lists
- **`InfringementForm`**: Shared form for creating/editing infringements with category/type dropdowns
- **`UserRoleIndicator`**: Badge showing user role (Enforcement Officer, Finance, Admin)
- **`FilterPanel`**: Sidebar/panel with date range, category, status filters
- **`ExportButton`**: Button to export data as CSV/PDF with loading states
- **`FinanceReportSummary`**: Display GL code totals and date ranges
- **`TeamCard`**: Show team info (name, district, member count)
- **`RouteCard`**: Display route details (name, area, assigned team)

#### Layout Components
- **`PageHeader`**: Consistent page titles with breadcrumbs and action buttons
- **`DashboardLayout`**: Sidebar + main content area wrapper
- **`EmptyState`**: Placeholder for no data with icon and call-to-action

#### Form Components (built on shadcn/ui)
- **`FormInput`**: Wrapped `Input` with label and error handling
- **`FormSelect`**: Dropdown with consistent styling
- **`FormDatePicker`**: Date/time picker with validation
- **`FormTextarea`**: Multi-line input for notes/descriptions

**Example Structure**:
\`\`\`
web/components/
├── ui/                    # shadcn/ui primitives
├── infringement-card.tsx
├── stat-card.tsx
├── data-table.tsx
├── infringement-form.tsx
├── user-role-indicator.tsx
├── filter-panel.tsx
├── export-button.tsx
├── finance-report-summary.tsx
├── team-card.tsx
├── route-card.tsx
├── page-header.tsx
├── dashboard-layout.tsx
└── empty-state.tsx
\`\`\`

---

### 6.2 Mobile App Components (`mobile/components/`)

**Purpose**: Build a consistent, performant mobile experience with reusable native components.

#### Core Components
- **`InfringementCard`**: Mobile-optimized card for infringement summaries (tap to view details)
- **`StatCard`**: Display key metrics on home screen
- **`CategoryPicker`**: Custom picker/dropdown for infringement categories
- **`TypePicker`**: Dependent picker that updates based on selected category
- **`InfringementForm`**: Form for recording infringements in the field
- **`PhotoCapture`**: Camera integration for evidence photos with preview
- **`LocationPicker`**: Map view or GPS coordinate display
- **`StatusBadge`**: Visual indicator for infringement status (pending, paid, void)
- **`VehicleDetailsInput`**: Grouped inputs for registration, make, model, color
- **`DateTimeSelector`**: Native date/time picker for issued_at field
- **`BottomSheet`**: Modal overlay for filters or additional actions

#### Layout Components
- **`ScreenContainer`**: Consistent padding and safe area handling
- **`LoadingOverlay`**: Full-screen loading indicator with message
- **`ErrorBoundary`**: Graceful error handling UI
- **`TabBarIcon`**: Consistent icon styling for bottom navigation

#### List Components
- **`InfringementList`**: Optimized FlatList for scrolling through infringements
- **`EmptyState`**: Placeholder when no infringements exist
- **`ListSeparator`**: Consistent divider between list items

**Example Structure**:
\`\`\`
mobile/components/
├── ui/                       # Base UI primitives
├── infringement-card.tsx
├── stat-card.tsx
├── category-picker.tsx
├── type-picker.tsx
├── infringement-form.tsx
├── photo-capture.tsx
├── location-picker.tsx
├── status-badge.tsx
├── vehicle-details-input.tsx
├── date-time-selector.tsx
├── bottom-sheet.tsx
├── screen-container.tsx
├── loading-overlay.tsx
├── error-boundary.tsx
├── tab-bar-icon.tsx
├── infringement-list.tsx
├── empty-state.tsx
└── list-separator.tsx
\`\`\`

---

### 6.3 Component Development Guidelines

#### Design Principles
1. **Single Responsibility**: Each component should do one thing well
2. **Composability**: Combine small components to build complex UIs
3. **Prop-driven**: Accept props for customization (color, size, variant)
4. **Accessibility**: Include proper labels, roles, and keyboard navigation
5. **Performance**: Memoize expensive components with \`React.memo\` or \`useMemo\`

#### Naming Conventions
- Use PascalCase for component names
- Be descriptive and specific (e.g., \`InfringementCard\` not \`Card\`)
- Group related components with prefixes (e.g., \`Form*\` components)

#### Props Pattern
\`\`\`tsx
// Good: Typed props with defaults
interface InfringementCardProps {
  infringement: Infringement;
  onPress?: () => void;
  variant?: 'default' | 'compact';
  showActions?: boolean;
}

export function InfringementCard({ 
  infringement, 
  onPress, 
  variant = 'default',
  showActions = true 
}: InfringementCardProps) {
  // Component implementation
}
\`\`\`

#### Code Reusability Best Practices
- **Extract Common Logic**: Use custom hooks for shared business logic (e.g., \`useInfringements\`, \`useAuth\`)
- **Share Type Definitions**: Keep TypeScript types in \`shared/types/\` for use across web and mobile
- **Consistent Styling**: Define theme tokens once, use everywhere
- **Document Components**: Add JSDoc comments explaining props and usage
- **Test Components**: Write unit tests for reusable components to prevent regressions

---

### 6.4 Cross-Platform Considerations

While web and mobile components won't share code directly, they should:
- **Mirror Functionality**: Same features, different implementations
- **Consistent Data Flow**: Use same API responses and data structures
- **Unified Design Language**: Same colors, typography scale, and spacing
- **Parallel Naming**: Use similar component names for easier mental mapping

**Example**: 
- Web: \`web/components/infringement-form.tsx\`
- Mobile: \`mobile/components/infringement-form.tsx\`
- Both accept similar props and handle the same infringement fields

---

### 6.5 Benefits of This Approach

✅ **Minimal Code**: Reuse components instead of duplicating logic  
✅ **Consistency**: Same look and feel across all screens  
✅ **Maintainability**: Update once, fix everywhere  
✅ **Developer Experience**: Faster development with pre-built components  
✅ **Testing**: Test components once, use with confidence  
✅ **Scalability**: Easy to add new features by composing existing components
