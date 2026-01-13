# **CONTRIBUTING.md**

# **Contributing to MANTIS**
MANTIS (Multi‑Agency National Traffic Infringement System) is a national‑scale civic platform built for the Fiji Islands.  
It supports LTA, Municipal Councils, and Fiji Police with unified, GIS‑enabled enforcement.

This document outlines how to contribute safely, consistently, and responsibly.

---

## **1. Core Principles**
MANTIS is built on four pillars:

- **Operational discipline** — every change must improve clarity, reliability, or maintainability.
- **Civic responsibility** — data accuracy and privacy are non‑negotiable.
- **APAC‑first engineering** — low bandwidth, offline‑first, mobile‑first.
- **Multi‑agency neutrality** — no change should advantage one agency over another.

Contributors must respect these principles at all times.

---

## **2. Code of Conduct**
By contributing, you agree to:

- Communicate respectfully with all contributors.
- Avoid political, cultural, or agency‑specific bias.
- Protect sensitive data and never commit real production credentials.
- Follow the architectural and security patterns already established.

---

## **3. Tech Stack Overview**
MANTIS uses:

- **React + Vite** (PWA)
- **Supabase** (Auth, Postgres, PostGIS, Storage, Edge Functions)
- **TanStack Query** (data fetching)
- **TypeScript** (strict mode)
- **Drizzle ORM** (schema + migrations)
- **PostGIS** (GIS boundaries + GPS points)

Understanding these technologies is recommended before contributing.

---

## **4. Project Structure**
```
src/
  components/
  hooks/
  pages/
  routes/
  services/
    supabase.ts
  stores/
  utils/
public/
  manifest.json
  icons/
supabase/
  migrations/
  functions/
README.md
CONTRIBUTING.md
```

---

## **5. Setting Up Your Environment**

### **1. Clone the repository**
```
git clone https://github.com/your-org/mantis.git
cd mantis
```

### **2. Install dependencies**
```
npm install
```

### **3. Create your environment file**
```
cp .env.example .env
```

Add your Supabase project URL + anon key.

### **4. Start the dev server**
```
npm run dev
```

---

## **6. Branching Strategy**
We use a simple, disciplined workflow:

### **Main branches**
- `main` — production-ready
- `develop` — integration branch for new features

### **Feature branches**
Name them like:

```
feature/officer-offline-sync
feature/gis-location-tree
fix/payment-reconciliation
chore/update-deps
```

---

## **7. Commit Guidelines**
Use clear, descriptive commit messages:

```
feat: add GIS jurisdiction resolver
fix: correct RLS policy for municipal teams
chore: update Supabase client version
refactor: simplify infringement form logic
```

Avoid vague messages like “update stuff” or “fix bug”.

---

## **8. Pull Request Process**

### **Before opening a PR**
- Ensure your branch is up to date with `develop`.
- Run the linter and formatter.
- Test your changes in offline mode (critical for officers).
- Confirm no secrets are committed.

### **PR Requirements**
- Clear description of the change.
- Screenshots or GIFs for UI changes.
- Reference any related issues.
- Include migration files if database schema changed.
- Include RLS policy updates if needed.

### **PR Review Checklist**
Reviewers will check:

- Code clarity and maintainability.
- Security implications (especially RLS).
- GIS correctness (if applicable).
- Performance impact on low‑bandwidth users.
- Consistency with existing patterns.

---

## **9. Database & GIS Contributions**

### **Schema changes**
- Must include a Drizzle migration.
- Must include Supabase SQL equivalent (if needed).
- Must not break existing RLS policies.

### **GIS changes**
- Polygons must be valid (no self‑intersections).
- Coordinate system must be **EPSG:4326**.
- Boundaries must reflect official Fiji government data.

---

## **10. Supabase Edge Functions**
When contributing functions:

- Keep them small and single‑purpose.
- Use TypeScript strict mode.
- Validate all inputs.
- Never trust client‑side data.
- Log actions to `audit_logs` when appropriate.

---

## **11. Testing**
MANTIS requires testing in:

- **Online mode**
- **Offline mode**
- **Low‑bandwidth mode**
- **Mobile PWA install**
- **Different agency roles**
- **Different team scopes**
- **Different GIS jurisdictions**

If your feature affects any of these, include test notes in your PR.

---

## **12. Security Expectations**
Contributors must:

- Respect RLS boundaries.
- Avoid exposing Supabase service keys.
- Never log sensitive data.
- Follow principle of least privilege.

---

## **13. How to Request Features**
Open an issue with:

- Title  
- Description  
- Agency impact  
- Screenshots or mockups  
- Technical notes (optional)

---

## **14. How to Report Bugs**
Include:

- Steps to reproduce  
- Expected behavior  
- Actual behavior  
- Device + browser  
- Online/offline state  
- Screenshots or logs  

---

## **15. License**
MANTIS is licensed under MIT unless otherwise required by government deployment.