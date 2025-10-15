# 🌐 API Specification — MANTIS

## Auth
- Supabase Auth manages login.
- Roles stored in `users.role`.

---

## Agencies
- `create_agency(name)`
- `list_agencies()`

## Users
- `create_user(agency_id, role, position, email)`
- `list_users(agency_id)`

## Teams & Routes
- `create_team(agency_id, name)`
- `assign_team_route(team_id, route_id)`
- `add_team_member(team_id, user_id)`

## Infringements
- `record_infringement(officer_id, type_id, vehicle_id, location_id, notes)`
- `list_infringements(agency_id, filters)`

## Infringement Types
- `list_infringement_categories()`
- `list_infringement_types(category_id)`

## Finance
- `list_fines_by_gl_code(agency_id, date_range)`
  - Returns aggregated infringements grouped by `gl_code`.

## Notes
- API responses should be structured to support dropdowns and tables in the web/mobile UI.
- Example: `list_infringement_types` should return `category`, `type`, `fine_amount`, and `gl_code` for display in shadcn/ui forms.
