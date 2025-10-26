# Agency Admin Quick Reference

## 🚀 Quick Start

### Login
- URL: `http://localhost:3001/auth/login`
- Test Account: `fpf.admin@mantis.gov.fj`
- Password: `Password123!`

---

## 📋 Management Pages

| Page | URL | Purpose |
|------|-----|---------|
| Teams | `/protected/teams` | Create and manage patrol teams |
| Routes | `/protected/routes` | Create and manage patrol routes |
| Locations | `/protected/locations` | Create and manage locations/stations |
| Users | `/protected/users` | Manage agency users |

---

## ⚡ Quick Actions

### Create Team
1. Go to `/protected/teams`
2. Click **[Create Team]**
3. Enter team name
4. Submit

### Create Route
1. Go to `/protected/routes`
2. Click **[Create Route]**
3. Enter name, description
4. Select start/end locations
5. Submit

### Create Location
1. Go to `/protected/locations`
2. Click **[Create Location]**
3. Enter name
4. Select type (Division, Station, Post, etc.)
5. Optionally select parent location
6. Submit

---

## 🔑 Key Permissions

✅ **Can Do:**
- View all teams, routes, locations in your agency
- Create new teams, routes, locations
- Edit existing items
- Delete items (if no dependencies)
- Assign officers to teams
- Assign routes to teams
- Manage team members

❌ **Cannot Do:**
- View other agencies' data
- Modify super admin settings
- Access system-wide reports
- Change own agency assignment

---

## 🎯 Common Workflows

### Setting Up a New Patrol Area

1. **Create Location**
   - `/protected/locations` → Create Location
   - Example: "Downtown Station"

2. **Create Route**
   - `/protected/routes` → Create Route
   - Example: "Downtown Patrol A"
   - Link to "Downtown Station"

3. **Create Team**
   - `/protected/teams` → Create Team
   - Example: "Alpha Team"

4. **Add Officers**
   - Teams page → Manage Members 👥
   - Select officers from list

5. **Assign Route**
   - Teams page → Manage Routes 🛣️
   - Assign "Downtown Patrol A"

---

## 🎨 UI Elements

### Action Buttons
- 👥 = Manage team members
- 🛣️ = Manage team routes
- ✏️ = Edit
- 🗑️ = Delete

### Status Badges
- **Purple** = Management items
- **Blue** = Dashboard
- **Orange** = Infringements
- **Green** = Performance

---

## 🔒 Security Notes

- All data is agency-isolated
- Row Level Security (RLS) enforced
- Cannot access other agencies
- All changes are logged
- Session timeout: 24 hours

---

## 📞 Support

### Troubleshooting
1. Can't create items → Check role is `agency_admin`
2. Don't see data → Verify agency assignment
3. Permission errors → Check RLS policies
4. UI errors → Check browser console

### Database Check
```sql
-- Verify your role and agency
SELECT role, agency_id FROM users WHERE id = auth.uid();
```

---

## 📊 Data Hierarchy

```
Agency (Fiji Police Force)
├── Locations
│   ├── Central Division
│   │   ├── Station A
│   │   └── Station B
│   └── Western Division
├── Routes
│   ├── Downtown Patrol (→ Central Division)
│   └── Highway A1 (→ Western Division)
└── Teams
    ├── Alpha Team
    │   ├── Members: Officer A, Officer B
    │   └── Routes: Downtown Patrol
    └── Bravo Team
        ├── Members: Officer C, Officer D
        └── Routes: Highway A1
```

---

## ✅ Checklist for New Agency Setup

- [ ] Create all location hierarchy (Divisions → Stations → Posts)
- [ ] Create patrol routes for each area
- [ ] Create teams based on shift/area
- [ ] Add officers to teams
- [ ] Assign routes to teams
- [ ] Test with one officer login
- [ ] Verify infringement recording works
- [ ] Review dashboard analytics

---

*Updated: October 22, 2025*
