# Dashboard Layout
A reusable layout component for dashboard pages with a role-aware sidebar.

## Features
- Role-based navigation (Super Admin, Agency Admin, Team Leader, Officer, Guest)
- Active route highlighting
- App icon + user role display
- Sign-out shortcut

Component source: `website/src/components/layouts/DashboardLayout.tsx`.

## Usage

### Basic Usage
```tsx
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function MyDashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1>My Dashboard Content</h1>
      </div>
    </DashboardLayout>
  );
}
```

### With TanStack Router
```tsx
import { createFileRoute } from "@tanstack/react-router";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export const Route = createFileRoute("/super-admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1>Super Admin Dashboard</h1>
      </div>
    </DashboardLayout>
  );
}
```

## Menu Items Configuration
`menuItems` defines the sidebar. Each item has `label`, `path`, `icon`, and `roles`.

```tsx
const menuItems: MenuItem[] = [
  {
    label: "New Page",
    path: "/super-admin/new-page",
    icon: FileText,
    roles: ["Super Admin"],
  },
];
```

## Role Types
Supported roles from `@/lib/types`:
- "Super Admin"
- "Agency Admin"
- "Team Leader"
- "Officer"
- "Guest"

## Styling
- Tailwind classes; shadcn/ui design system
- Sidebar uses neutral border, active item uses primary background
- Icons sized 20px

## Dependencies
- `@tanstack/react-router`
- `lucide-react`
- `@/contexts/AuthContext`
- `@/lib/utils` (`cn` helper)
