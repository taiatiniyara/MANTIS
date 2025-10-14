# System Initialization - Visual Flow Diagram

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MANTIS Web App                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Login Page (/login)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  useSystemStatus() Hook                                │ │
│  │  ├─ React Query Cache (5min)                          │ │
│  │  └─ checkSystemStatus() API                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│                      ┌──────────────┐                        │
│                      │ User Count?  │                        │
│                      └──────┬───────┘                        │
│                             │                                │
│              ┌──────────────┴───────────────┐               │
│              ▼                              ▼               │
│         Users > 0                      Users = 0            │
│    ┌──────────────────┐          ┌──────────────────┐      │
│    │ Show Login Form  │          │ Redirect to      │      │
│    │ [Normal Flow]    │          │ /system-init     │      │
│    └──────────────────┘          └──────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────┐
│              System Init Page (/system-init)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Check System Status                                │ │
│  │     ├─ Query users table                              │ │
│  │     └─ Get user count                                 │ │
│  │                                                        │ │
│  │  2. Display Status                                    │ │
│  │     ├─ If users > 0: "Already Initialized"           │ │
│  │     │   └─ Redirect to /login                        │ │
│  │     │                                                 │ │
│  │     └─ If users = 0: "No Users Found"                │ │
│  │         └─ Show Initialize Button                    │ │
│  │                                                        │ │
│  │  3. Initialize System (on button click)              │ │
│  │     ├─ Call createFirstAdmin()                       │ │
│  │     │   ├─ Create auth.user (Supabase Auth)         │ │
│  │     │   ├─ Create user profile (users table)        │ │
│  │     │   └─ Sign in new user                         │ │
│  │     │                                                │ │
│  │     └─ On Success                                    │ │
│  │         ├─ Show success message                     │ │
│  │         └─ Redirect to dashboard (/)                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

## Data Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │         │  React App   │         │  Supabase   │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ 1. Navigate to /login │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │ 2. Check user count   │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │ 3. Return count: 0    │
       │                       │<───────────────────────┤
       │                       │                        │
       │ 4. Redirect to        │                        │
       │    /system-init       │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │ 5. View init page     │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │ 6. Click "Initialize" │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │ 7. signUp()           │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │ 8. Create auth user   │
       │                       │<───────────────────────┤
       │                       │                        │
       │                       │ 9. Insert user profile│
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │ 10. Profile created   │
       │                       │<───────────────────────┤
       │                       │                        │
       │                       │ 11. signIn()          │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │ 12. Session token     │
       │                       │<───────────────────────┤
       │                       │                        │
       │ 13. Success! Redirect │                        │
       │     to dashboard      │                        │
       │<──────────────────────┤                        │
       │                       │                        │
```

## State Machine

```
                    ┌───────────────┐
                    │  App Started  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Checking    │
                    │     System    │
                    │    Status     │
                    └───────┬───────┘
                            │
                ┌───────────┴────────────┐
                ▼                        ▼
        ┌───────────────┐        ┌──────────────┐
        │  Has Users    │        │  No Users    │
        └───────┬───────┘        └──────┬───────┘
                │                       │
                ▼                       ▼
        ┌───────────────┐        ┌──────────────┐
        │  Show Login   │        │ Show Init    │
        │     Form      │        │   Screen     │
        └───────┬───────┘        └──────┬───────┘
                │                       │
                │                       │ User clicks
                │                       │ "Initialize"
                │                       ▼
                │                ┌──────────────┐
                │                │ Creating     │
                │                │ First Admin  │
                │                └──────┬───────┘
                │                       │
                │          ┌────────────┴─────────────┐
                │          ▼                          ▼
                │   ┌──────────────┐          ┌──────────────┐
                │   │   Success    │          │    Error     │
                │   └──────┬───────┘          └──────┬───────┘
                │          │                          │
                │          ▼                          │
                │   ┌──────────────┐                 │
                │   │  Auto Sign   │                 │
                │   │      In      │                 │
                │   └──────┬───────┘                 │
                │          │                          │
                └──────────┴──────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Dashboard   │
                    │   (Logged In) │
                    └───────────────┘
```

## Component Relationships

```
┌─────────────────────────────────────────────────────────┐
│                    Root Layout                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │                  AppShell                         │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │          AuthProvider (Context)             │ │ │
│  │  │  ┌───────────────────────────────────────┐  │ │ │
│  │  │  │            Router                     │  │ │ │
│  │  │  │  ┌─────────────────────────────────┐ │  │ │ │
│  │  │  │  │  Login (/login)                 │ │  │ │ │
│  │  │  │  │  ├─ useSystemStatus()           │ │  │ │ │
│  │  │  │  │  └─ useAuth()                   │ │  │ │ │
│  │  │  │  └─────────────────────────────────┘ │  │ │ │
│  │  │  │  ┌─────────────────────────────────┐ │  │ │ │
│  │  │  │  │  System Init (/system-init)     │ │  │ │ │
│  │  │  │  │  ├─ checkSystemStatus()         │ │  │ │ │
│  │  │  │  │  └─ createFirstAdmin()          │ │  │ │ │
│  │  │  │  └─────────────────────────────────┘ │  │ │ │
│  │  │  │  ┌─────────────────────────────────┐ │  │ │ │
│  │  │  │  │  Dashboard (/)                  │ │  │ │ │
│  │  │  │  │  └─ ProtectedRoute              │ │  │ │ │
│  │  │  │  └─────────────────────────────────┘ │  │ │ │
│  │  │  └───────────────────────────────────────┘  │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
           ┌───────────────────────────────┐
           │      Supabase Client          │
           │  ┌─────────────────────────┐  │
           │  │     Auth Service        │  │
           │  │  - signUp()            │  │
           │  │  - signIn()            │  │
           │  │  - signOut()           │  │
           │  └─────────────────────────┘  │
           │  ┌─────────────────────────┐  │
           │  │   Database Service      │  │
           │  │  - users table         │  │
           │  │  - agencies table      │  │
           │  └─────────────────────────┘  │
           └───────────────────────────────┘
```

## API Call Sequence

### Check System Status
```
Browser → useSystemStatus() → checkSystemStatus()
    ↓
supabase.from('users').select('*', { count: 'exact', head: true })
    ↓
Returns: { count: number }
    ↓
Transform to: { hasUsers: boolean, userCount: number, initialized: boolean }
```

### Create First Admin
```
Browser → Click "Initialize" → createFirstAdmin(userData)
    ↓
1. supabase.auth.signUp({ email, password })
    ↓
2. supabase.from('users').insert({
     id: authUser.id,
     display_name: userData.displayName,
     role: 'central_admin',
     agency_id: null,
     active: true
   })
    ↓
3. supabase.auth.signInWithPassword({ email, password })
    ↓
Returns: { user, session }
```

## Error Handling Flow

```
                  ┌──────────────┐
                  │ API Call     │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  Try Block   │
                  └──────┬───────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
    ┌──────────────┐          ┌──────────────┐
    │   Success    │          │    Error     │
    └──────┬───────┘          └──────┬───────┘
           │                          │
           ▼                          ▼
    ┌──────────────┐          ┌──────────────┐
    │ Return Data  │          │ Catch Block  │
    └──────────────┘          └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ Log Error    │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ Show Error   │
                              │ Message to   │
                              │ User         │
                              └──────────────┘
```

## UI States

### Login Page States
```
1. [Loading]     → Checking system status...
2. [No Users]    → Redirect to /system-init
3. [Has Users]   → Show login form
4. [Signing In]  → Show spinner on button
5. [Error]       → Show error message
6. [Success]     → Redirect to dashboard
```

### System Init Page States
```
1. [Loading]        → Checking system status...
2. [Already Init]   → "System already initialized" → Redirect
3. [Needs Init]     → Show initialization UI
4. [Initializing]   → "Initializing System..." (disabled button)
5. [Error]          → Show error message
6. [Success]        → "System Initialized Successfully!" → Redirect
```

---

**Legend**:
- `→` : Data/Control flow
- `├─` : Component/Function relationship
- `▼` : Sequential step
- `┌─┐` : Component/Process boundary
