# Drag-and-Drop Team Management

## Overview
This document describes the new drag-and-drop interfaces for managing team members and routes. These interfaces replace the previous dialog-based forms with full-page drag-and-drop components for a more intuitive user experience.

## Features

### Team Members Management
- **Drag-and-drop interface** for assigning users to teams
- **Two-column layout**: Available users on the left, Team members on the right
- **Search functionality**: Filter users by position, email, or role
- **Quick add buttons**: Click the + icon to quickly add users (visible on hover)
- **Visual feedback**: Draggable items show grip handles and change appearance during drag
- **Real-time updates**: Changes are immediately saved to the database

### Team Routes Management
- **Drag-and-drop interface** for assigning routes to teams
- **Two-column layout**: Available routes on the left, Assigned routes on the right
- **Search functionality**: Filter routes by name or description
- **Coverage area display**: Shows the number of polygon points for each route
- **Quick add buttons**: Click the + icon to quickly assign routes
- **Visual feedback**: Routes change appearance when being dragged
- **Real-time updates**: Route assignments are immediately saved

## Components

### ManageTeamMembersPage
- **Location**: `web/components/admin/manage-team-members-page.tsx`
- **Purpose**: Full-page component for managing team member assignments
- **Features**:
  - Drag-and-drop functionality using HTML5 Drag and Drop API
  - Two-column responsive layout
  - Search filtering
  - Instructions card explaining how to use drag-and-drop
  - Loading and empty states
  - Error handling with toast notifications

### ManageTeamRoutesPage
- **Location**: `web/components/admin/manage-team-routes-page.tsx`
- **Purpose**: Full-page component for managing team route assignments
- **Features**:
  - Drag-and-drop functionality for routes
  - Two-column responsive layout
  - Search by route name or description
  - Coverage area polygon point count display
  - Instructions card
  - Loading and empty states
  - Error handling

## Routes

### Admin Routes (Super Admin)
- **Team Members**: `/admin/teams/[id]/members`
- **Team Routes**: `/admin/teams/[id]/routes`

### Protected Routes (Agency Admin / Team Leader)
- **Team Members**: `/protected/teams/[id]/members`
- **Team Routes**: `/protected/teams/[id]/routes`

## Page Files

### Admin Pages
- `web/app/admin/teams/[id]/members/page.tsx`
  - Server component for super admin team member management
  - Fetches team details and all users
  - Handles authentication and permissions
  
- `web/app/admin/teams/[id]/routes/page.tsx`
  - Server component for super admin route management
  - Fetches team details
  - Handles authentication and permissions

### Protected Pages
- `web/app/protected/teams/[id]/members/page.tsx`
  - Server component for agency admin/team leader member management
  - Fetches team details and users from the same agency
  - Handles authentication and agency-scoped permissions
  
- `web/app/protected/teams/[id]/routes/page.tsx`
  - Server component for agency admin/team leader route management
  - Fetches team details
  - Handles authentication and agency-scoped permissions

## Updated Components

### TeamsTable
- **Location**: `web/components/admin/teams-table.tsx`
- **Changes**:
  - Removed dialog-based management
  - Added Link buttons for navigation
  - Added `baseUrl` prop to determine routing context
  - Removed `ManageTeamMembersDialog` and `ManageTeamRoutesDialog` imports
  - Uses `Link` component for navigation instead of opening dialogs

### Teams List Pages
- `web/app/admin/teams/page.tsx` - Updated to pass `baseUrl="/admin"`
- `web/app/protected/teams/page.tsx` - Updated to pass `baseUrl="/protected"`

## How to Use

### Assigning Team Members
1. Navigate to the teams list
2. Click the **UserPlus icon** next to a team
3. You'll see two columns:
   - **Available Users** (left): All users not in this team
   - **Team Members** (right): Current team members
4. **Drag users** from left to right to add them to the team
5. **Drag users** from right to left to remove them from the team
6. Or use the **+ button** on hover for quick assignment
7. Use the **search bar** to filter users

### Assigning Routes to Teams
1. Navigate to the teams list
2. Click the **Route icon** next to a team
3. You'll see two columns:
   - **Available Routes** (left): All routes not assigned to this team
   - **Assigned Routes** (right): Routes currently assigned to the team
4. **Drag routes** from left to right to assign them
5. **Drag routes** from right to left to unassign them
6. Or use the **+ button** for quick assignment
7. Use the **search bar** to filter routes by name or description

## Technical Details

### Drag and Drop Implementation
- Uses native **HTML5 Drag and Drop API**
- No external drag-and-drop library required
- `draggable={true}` attribute on all draggable items
- `onDragStart`, `onDragOver`, and `onDrop` event handlers
- `dataTransfer.effectAllowed` and `dataTransfer.dropEffect` for visual feedback

### State Management
- Uses React `useState` for local state
- `draggedUser` or `draggedRoute` tracks the currently dragged item
- `teamMembers` and `availableUsers` (or `teamRoutes`/`availableRoutes`) manage lists
- `searchTerm` for filtering
- `isLoading` for loading states

### Database Operations
- **Add member**: Inserts into `team_members` table
- **Remove member**: Deletes from `team_members` table
- **Assign route**: Updates `team_id` in `routes` table
- **Unassign route**: Sets `team_id` to NULL in `routes` table
- All operations use Supabase client with error handling

### Permissions
- **Super Admin**: Can manage all teams across all agencies
- **Agency Admin**: Can only manage teams in their agency
- **Team Leader**: Can only manage their own team (if implemented)
- Server-side authentication checks prevent unauthorized access
- RLS policies enforce database-level security

## Styling

### Layout
- Two-column grid layout: `grid-cols-1 lg:grid-cols-2`
- Responsive design: Stacks on mobile, side-by-side on desktop
- Sticky headers for better UX with long lists

### Visual Feedback
- **Drag handle**: GripVertical icon indicates draggable items
- **Hover effects**: Quick add buttons appear on hover
- **Drop zones**: Cards highlight when items are dragged over them
- **Empty states**: Helpful messages when lists are empty
- **Badges**: Show member counts and polygon point counts

### Theme
- Uses Shadcn UI components for consistent design
- Card, Badge, Input, Button components
- Lucide React icons (GripVertical, UserPlus, MapPin)
- Toast notifications for success/error messages

## Migration from Dialogs

### Before
- Team member and route management used dialog components
- Limited space for viewing and managing assignments
- Less intuitive interaction pattern

### After
- Full-page interfaces with more space
- Drag-and-drop provides intuitive interaction
- Better visibility of available and assigned items
- Search functionality improves usability for large lists

## Legacy Components

The following dialog components are now replaced but still exist:
- `web/components/admin/manage-team-members-dialog.tsx`
- `web/components/admin/manage-team-routes-dialog.tsx`

These can be removed once the new pages are fully tested and verified.

## Future Enhancements

### Potential Improvements
- **Bulk operations**: Select multiple items to assign/unassign at once
- **Undo functionality**: Allow users to undo recent changes
- **Activity log**: Show recent assignment changes
- **Sorting options**: Sort by different criteria (name, date, etc.)
- **Advanced filters**: Filter by multiple criteria simultaneously
- **Drag preview**: Show custom preview during drag operation
- **Keyboard shortcuts**: Support keyboard navigation for accessibility
- **Export/Import**: Bulk import team assignments from CSV

## Testing Checklist

- [ ] Test drag from available to team
- [ ] Test drag from team to available
- [ ] Test quick add buttons
- [ ] Test search filtering
- [ ] Test on mobile (responsive layout)
- [ ] Test with empty lists
- [ ] Test error handling (network failures)
- [ ] Test permissions (super admin vs agency admin)
- [ ] Test with large datasets (performance)
- [ ] Test browser compatibility

## Related Documentation
- [Route Form Migration](./ROUTE_FORM_FULL_PAGE_MIGRATION.md)
- [Admin User Guide](./ADMIN_USER_GUIDE.md)
- [Database Schema](./schema.md)
