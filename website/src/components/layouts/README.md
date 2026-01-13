# Dashboard Layout

A reusable layout component for all dashboard pages with a sidebar navigation that adapts to user roles.

## Features

- **Role-based Navigation**: Automatically shows menu items based on the user's role (Super Admin, Agency Admin, Team Leader, Officer, or Guest)
- **Active Route Highlighting**: Highlights the current active menu item
- **App Icon**: Displays the app icon at the top of the sidebar
- **User Info**: Shows current user role at the bottom
- **Sign Out**: Provides a sign-out button in the sidebar

## Usage

### Basic Usage

Wrap your page content with the `DashboardLayout` component:

```tsx
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function MyDashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1>My Dashboard Content</h1>
        {/* Your page content here */}
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
        {/* Your dashboard content */}
      </div>
    </DashboardLayout>
  );
}
```

## Menu Items Configuration

The sidebar menu is configured in the `menuItems` array. Each menu item has:

- `label`: Display text
- `path`: Route path
- `icon`: Lucide React icon component
- `roles`: Array of roles that can see this menu item

### Adding New Menu Items

Edit the `menuItems` array in `DashboardLayout.tsx`:

```tsx
const menuItems: MenuItem[] = [
  {
    label: "New Page",
    path: "/super-admin/new-page",
    icon: FileText,
    roles: ["Super Admin"],
  },
  // ... other items
];
```

## Role Types

The layout supports these roles defined in `@/lib/types`:

- `"Super Admin"` - Full system access
- `"Agency Admin"` - Agency-level management
- `"Team Leader"` - Team management
- `"Officer"` - Basic user access
- `"Guest"` - Limited access

## Styling

The layout uses Tailwind CSS classes and follows the shadcn/ui design system. Key styling elements:

- **Sidebar**: White background with gray border
- **Active Menu Item**: Primary color background
- **Hover States**: Gray background on hover
- **Icon Size**: 5x5 (20px)

## Dependencies

- `@tanstack/react-router` - For navigation
- `lucide-react` - For icons
- `@/contexts/AuthContext` - For user authentication state
- `@/lib/utils` - For the `cn` utility
