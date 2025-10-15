# 🚀 Onboarding Guide — MANTIS

## Prerequisites
- Node.js (LTS)
- Supabase CLI
- Expo CLI

## Setup
1. Clone the repo
2. Create a Supabase project in the cloud
3. Copy `.env.example` → `.env.local` and add:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`

4. Push schema:
supabase db push

5. Seed initial data:
supabase db seed

6. Running Apps
    Web dashboard:
        bash
        cd web && npm run dev
    Mobile officer app:
        bash
        cd mobile && expo start