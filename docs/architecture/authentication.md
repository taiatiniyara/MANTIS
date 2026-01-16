# Authentication & Authorization

MANTIS implements a comprehensive auth system using Supabase Auth with role-based access control (RBAC) and Row Level Security (RLS).

## Authentication Flow

### User Registration

```typescript
// 1. User submits registration form
const { data, error } = await supabase.auth.signUp({
  email: 'officer@lta.gov.fj',
  password: 'secure_password',
  options: {
    data: {
      display_name: 'John Doe'
    }
  }
});

// 2. Verification email sent
// 3. User clicks verification link
// 4. Admin assigns role and agency
```

### User Login

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'officer@lta.gov.fj',
  password: 'secure_password'
});

if (data.session) {
  // Store session token
  // Redirect to dashboard
}
```

### Session Management

```typescript
// Check current session
const { data: { session } } = await supabase.auth.getSession();

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Handle sign in
  } else if (event === 'SIGNED_OUT') {
    // Handle sign out
  }
});

// Sign out
await supabase.auth.signOut();
```

## User Roles

### Role Hierarchy

```
Super Admin (System-wide)
  └─ Agency Admin (Agency-wide)
      └─ Team Leader (Team-wide)
          └─ Officer (Field operations)
```

### Role Definitions

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Super Admin** | System administrator | Full access across all agencies |
| **Agency Admin** | Agency manager | Manage agency users, teams, locations |
| **Team Leader** | Team supervisor | Manage team members, review infringements |
| **Officer** | Field officer | Create infringements, upload evidence |
| **Citizen** | Public user | View own infringements, submit payments |
| **Government Official** | Oversight | Read-only access to reports |

### Role Implementation

```typescript
export type Role = 
  | "Super Admin"
  | "Agency Admin"
  | "Team Leader"
  | "Officer"
  | "Citizen"
  | "Government Official";

interface User {
  id: string;
  agency_id: string;
  team_id: string | null;
  role: Role;
  display_name: string | null;
}
```

## Row Level Security (RLS)

### Policy Structure

Supabase RLS policies enforce data isolation at the database level:

```sql
-- Example: Officers can only read their agency's infringements
CREATE POLICY "officers_read_agency_infringements"
ON infringements
FOR SELECT
USING (
  agency_id = (
    SELECT agency_id 
    FROM users 
    WHERE id = auth.uid()
  )
);
```

### Core Policies

#### Users Table

```sql
-- Users can read their own profile
CREATE POLICY "users_read_own"
ON users FOR SELECT
USING (auth.uid() = id);

-- Agency Admins can read their agency's users
CREATE POLICY "agency_admin_read_users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'Agency Admin'
    AND u.agency_id = users.agency_id
  )
);

-- Super Admins can read all users
CREATE POLICY "super_admin_read_all_users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'Super Admin'
  )
);
```

#### Infringements Table

```sql
-- Officers can read their agency's infringements
CREATE POLICY "officers_read_agency_infringements"
ON infringements FOR SELECT
USING (
  agency_id = (
    SELECT agency_id FROM users WHERE id = auth.uid()
  )
);

-- Officers can create infringements for their agency
CREATE POLICY "officers_create_infringements"
ON infringements FOR INSERT
WITH CHECK (
  agency_id = (
    SELECT agency_id FROM users WHERE id = auth.uid()
  )
  AND issued_by = auth.uid()
);

-- Officers cannot update infringements after creation
-- Only admins can update
CREATE POLICY "admin_update_infringements"
ON infringements FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('Super Admin', 'Agency Admin', 'Team Leader')
    AND agency_id = infringements.agency_id
  )
);
```

#### Agencies Table

```sql
-- Everyone can read agencies (for dropdown lists)
CREATE POLICY "public_read_agencies"
ON agencies FOR SELECT
TO authenticated
USING (true);

-- Only Super Admins can modify agencies
CREATE POLICY "super_admin_manage_agencies"
ON agencies FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'Super Admin'
  )
);
```

#### Teams Table

```sql
-- Users can read their own team and agency teams
CREATE POLICY "users_read_teams"
ON teams FOR SELECT
USING (
  id = (SELECT team_id FROM users WHERE id = auth.uid())
  OR agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
);

-- Agency Admins can manage teams
CREATE POLICY "agency_admin_manage_teams"
ON teams FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('Super Admin', 'Agency Admin')
    AND agency_id = teams.agency_id
  )
);
```

## Authorization Checks

### Frontend Authorization

```typescript
// Check user role
function hasRole(user: User, roles: Role[]): boolean {
  return roles.includes(user.role);
}

// Usage
if (hasRole(user, ['Super Admin', 'Agency Admin'])) {
  // Show admin features
}
```

### Route Protection

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from '@tanstack/react-router';

function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const { user, userMetadata, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user) {
    return <Navigate to="/auth/login" />;
  }
  
  if (!userMetadata || !allowedRoles.includes(userMetadata.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
}

// Usage
<ProtectedRoute allowedRoles={['Super Admin']}>
  <SuperAdminDashboard />
</ProtectedRoute>
```

### Action Authorization

```typescript
async function deleteInfringement(id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('role, agency_id')
    .eq('id', auth.uid())
    .single();
    
  // Check role
  if (!['Super Admin', 'Agency Admin'].includes(user.role)) {
    throw new Error('Unauthorized');
  }
  
  // RLS will also enforce this at database level
  const { error } = await supabase
    .from('infringements')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}
```

## Security Best Practices

### 1. Never Trust Client Input

Always validate permissions on the backend:

```typescript
// ❌ Bad: Client-side only check
if (user.role === 'Admin') {
  deleteUser(userId); // RLS must also enforce this
}

// ✅ Good: RLS policy enforces at database level
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId);
// RLS will block if user is not authorized
```

### 2. Use RLS for All Tables

Every table should have RLS enabled:

```sql
ALTER TABLE infringements ENABLE ROW LEVEL SECURITY;
```

### 3. Principle of Least Privilege

Grant minimum necessary permissions:

```typescript
// Officer should only access their own agency
const { data } = await supabase
  .from('infringements')
  .select('*')
  .eq('agency_id', user.agency_id); // RLS enforces this
```

### 4. Secure Session Storage

```typescript
// Store session securely
// Supabase automatically handles this with HTTP-only cookies
// Never store tokens in localStorage for sensitive apps
```

### 5. Password Requirements

```typescript
function validatePassword(password: string): boolean {
  return (
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
```

## Auth Context

### Implementation

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  userMetadata: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userMetadata, setUserMetadata] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });
    
    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, userMetadata, ... }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Common Auth Scenarios

### 1. First-Time Super Admin Setup

```sql
-- Manually create first Super Admin in Supabase dashboard
INSERT INTO users (id, agency_id, role, display_name)
VALUES (
  'auth-user-id',  -- From auth.users table
  'system-agency-id',
  'Super Admin',
  'System Administrator'
);
```

### 2. Forgot Password

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(
  'officer@lta.gov.fj',
  {
    redirectTo: 'https://mantis.gov.fj/auth/reset-password'
  }
);
```

### 3. Change Password

```typescript
const { error } = await supabase.auth.updateUser({
  password: 'new_secure_password'
});
```

### 4. Update Profile

```typescript
const { error } = await supabase
  .from('users')
  .update({ display_name: 'New Name' })
  .eq('id', user.id);
```

## Troubleshooting

### "Row Level Security policy violated"

- Check if user has correct role
- Verify RLS policies are correct
- Ensure user is in correct agency/team

### Session Expired

```typescript
const { data, error } = await supabase.auth.refreshSession();
if (error) {
  // Redirect to login
}
```

### Multi-Tab Sync

Supabase automatically syncs auth state across tabs using `BroadcastChannel`.

---

**Next:** [Multi-Agency Structure](./07-multi-agency.md)
