# Agency Admin UI Guide

## Updated Pages Overview

All three management pages now include CREATE buttons in the header for agency admins.

---

## 1. Teams Management Page

**URL:** `/protected/teams`

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Teams Management                          [Create Team]     │
│  Manage patrol teams within your agency                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Team Name    │  Agency           │  Members  │  Actions     │
│  ───────────────────────────────────────────────────────────│
│  👥 Alpha Team │ Fiji Police Force │ 5 members │ 👥 🛣️ ✏️ 🗑️ │
│  👥 Bravo Team │ Fiji Police Force │ 3 members │ 👥 🛣️ ✏️ 🗑️ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Action Buttons
- 👥 **Manage Members** - Add/remove officers from team
- 🛣️ **Manage Routes** - Assign routes to team
- ✏️ **Edit** - Update team details
- 🗑️ **Delete** - Remove team

### Create Team Dialog
```
┌──────────────────────────────────────┐
│  👥 Create Team                      │
│  Create a new team for organizing... │
├──────────────────────────────────────┤
│                                      │
│  Team Name:                          │
│  [_____________________________]     │
│                                      │
│  (Agency auto-assigned)              │
│                                      │
│           [Cancel]  [Create Team]    │
└──────────────────────────────────────┘
```

---

## 2. Routes Management Page

**URL:** `/protected/routes`

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Routes Management                        [Create Route]     │
│  Manage patrol routes within your agency                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Route Name        │  Location      │  Agency     │ Actions  │
│  ────────────────────────────────────────────────────────── │
│  🛣️ Downtown Route │ Central Div    │ FPF         │ ✏️ 🗑️   │
│  🛣️ Highway A1     │ Western Div    │ FPF         │ ✏️ 🗑️   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Action Buttons
- ✏️ **Edit** - Update route details
- 🗑️ **Delete** - Remove route

### Create Route Dialog
```
┌──────────────────────────────────────┐
│  🛣️ Create Route                     │
│  Create a new patrol route           │
├──────────────────────────────────────┤
│                                      │
│  Route Name:                         │
│  [_____________________________]     │
│                                      │
│  Description:                        │
│  [_____________________________]     │
│  [_____________________________]     │
│                                      │
│  Start Location:                     │
│  [▼ Select location...]              │
│                                      │
│  End Location (optional):            │
│  [▼ Select location...]              │
│                                      │
│  (Agency auto-assigned)              │
│                                      │
│           [Cancel]  [Create Route]   │
└──────────────────────────────────────┘
```

---

## 3. Locations Management Page

**URL:** `/protected/locations`

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Locations Management                   [Create Location]    │
│  Manage locations and hierarchies within your agency         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Name          │  Type      │  Parent       │  Agency │ Act. │
│  ────────────────────────────────────────────────────────── │
│  📍 Central Div│  Division  │  -            │  FPF    │ ✏️ 🗑️│
│    └ Station A │  Station   │  Central Div  │  FPF    │ ✏️ 🗑️│
│      └ Post 1  │  Post      │  Station A    │  FPF    │ ✏️ 🗑️│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Action Buttons
- ✏️ **Edit** - Update location details
- 🗑️ **Delete** - Remove location

### Create Location Dialog
```
┌──────────────────────────────────────┐
│  📍 Create Location                  │
│  Add a new location to your agency   │
├──────────────────────────────────────┤
│                                      │
│  Location Name:                      │
│  [_____________________________]     │
│                                      │
│  Type:                               │
│  [▼ Division .....................]  │
│     Division                         │
│     Station                          │
│     Post                             │
│     Region                           │
│     Office                           │
│     Council                          │
│     Department                       │
│     Zone                             │
│                                      │
│  Parent Location (optional):         │
│  [▼ Select parent location...]       │
│                                      │
│  Address (optional):                 │
│  [_____________________________]     │
│                                      │
│  Latitude (optional):                │
│  [_____________________________]     │
│                                      │
│  Longitude (optional):               │
│  [_____________________________]     │
│                                      │
│  (Agency auto-assigned)              │
│                                      │
│         [Cancel]  [Create Location]  │
└──────────────────────────────────────┘
```

---

## Sidebar Navigation

Agency admins see this navigation structure:

```
┌────────────────────────┐
│  MANTIS                │
│  🛡️ Fiji Police Force  │
├────────────────────────┤
│                        │
│  🏠 Dashboard          │
│  📄 Infringements      │
│                        │
│  ──── MANAGEMENT ───── │
│                        │
│  👥 Users              │
│  👥 Teams              │ ← Click here
│  🛣️ Routes             │ ← Click here
│  📍 Locations          │ ← Click here
│                        │
└────────────────────────┘
```

---

## Workflow Examples

### 1. Setting Up a New Team and Route

**Step 1:** Create Locations
```
/protected/locations
→ Click "Create Location"
→ Name: "Central Division", Type: "Division"
→ Submit
```

**Step 2:** Create Route
```
/protected/routes
→ Click "Create Route"
→ Name: "Downtown Patrol"
→ Start Location: "Central Division"
→ Submit
```

**Step 3:** Create Team
```
/protected/teams
→ Click "Create Team"
→ Name: "Alpha Team"
→ Submit
```

**Step 4:** Add Members to Team
```
→ Click 👥 "Manage Members" on Alpha Team
→ Select officers from dropdown
→ Click "Add Member"
```

**Step 5:** Assign Route to Team
```
→ Click 🛣️ "Manage Routes" on Alpha Team
→ Select "Downtown Patrol" from dropdown
→ Click "Add Route"
```

---

### 2. Creating Hierarchical Locations

**Parent Location:**
```
Name: Central Division
Type: Division
Parent: (none)
```

**Child Location:**
```
Name: Station A
Type: Station
Parent: Central Division
```

**Sub-location:**
```
Name: Post 1
Type: Post
Parent: Station A
```

Result:
```
Central Division
└── Station A
    └── Post 1
```

---

## Color Coding

### Management Section (Purple)
All management pages use purple accents:
- Hover states: Light purple background
- Icons: Purple color
- Section header: Purple text with purple dividers

### Dashboard (Blue)
- Primary navigation item
- Blue accents and icons

### Infringements (Orange)
- Orange accents for high visibility
- Distinct from management functions

### Officer Performance (Green)
- Only visible to officers
- Green accents for positive metrics

---

## Keyboard Shortcuts

### Navigation
- `Tab` - Navigate through form fields
- `Enter` - Submit forms
- `Esc` - Close dialogs

### Table Actions
- Click table row to select
- Action buttons appear on hover

---

## Mobile Responsive

All pages are responsive:
- **Desktop**: Full table view with all columns
- **Tablet**: Condensed columns, scrollable
- **Mobile**: Card layout, stacked information

---

## Data Validation

### Team Name
- Required field
- Minimum 2 characters
- Auto-trims whitespace

### Route Name
- Required field
- Description optional
- Must select at least start location

### Location Name
- Required field
- Must select location type
- Parent location optional (for hierarchy)
- Coordinates optional (for GIS features)

---

## Error Handling

### Common Errors

**Permission Denied**
```
❌ Error creating team
You don't have permission to create teams
```
→ Check user role is `agency_admin`

**Duplicate Name**
```
❌ Error creating location
A location with this name already exists
```
→ Choose a unique name

**Missing Required Field**
```
❌ Please fill in all required fields
```
→ Check all required fields are filled

---

## Success Messages

### Team Created
```
✅ Success
Team created successfully
```

### Route Created
```
✅ Success
Route created successfully
```

### Location Created
```
✅ Success
Location created successfully
```

---

*Last Updated: October 22, 2025*
*MANTIS - Multi-Agency Network Traffic Infringement System*
