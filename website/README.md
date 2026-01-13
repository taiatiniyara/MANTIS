# **MANTIS — Multi‑Agency National Traffic Infringement System**  
A unified, GIS‑enabled enforcement platform for the Fiji Islands.

MANTIS is a **React + Vite Progressive Web App** powered by **Supabase**. It enables Fiji’s enforcement agencies — **LTA**, **Municipal Councils**, and **Fiji Police** — to issue, manage, and track traffic infringements through a centralized, secure, and mobile‑friendly system.

The platform is designed for **low‑bandwidth environments**, **offline‑first field operations**, and **multi‑agency collaboration** with strict data separation.

---

## **Features**
- **Unified multi‑agency enforcement**
  - LTA, Police, and Municipal Councils operate on one platform with clean separation.
- **GIS‑based jurisdiction**
  - PostGIS‑powered location hierarchy (country → division → municipal → ward → office).
  - Automatic jurisdiction resolution for infringements.
- **Offline‑first officer workflow**
  - Capture infringements, photos, and GPS data without connectivity.
  - Automatic background sync when online.
- **Supabase‑powered backend**
  - Auth, RLS, Postgres, PostGIS, Storage, and Edge Functions.
- **Teams & roles**
  - Agencies → Teams → Officers with granular permissions.
- **Evidence management**
  - Secure upload of photos/videos to Supabase Storage.
- **Appeals & payments**
  - Integrated workflows for citizens and finance teams.
- **PWA**
  - Installable, mobile‑friendly, fast, and reliable.

---

## **Tech Stack**
| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| App Shell | PWA (Service Worker + Manifest) |
| State/Data | TanStack Query + Supabase Client |
| Backend | Supabase (Postgres + PostGIS + RLS + Storage + Edge Functions) |
| GIS | PostGIS geometry (Point + Polygon) |
| Auth | Supabase Auth (email OTP, magic links, SSO-ready) |

---

## **Environment Variables**
Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never commit secrets or service role keys.

---

## **Getting Started**

### **1. Install dependencies**
```
npm install
```

### **2. Start development server**
```
npm run dev
```

### **3. Build for production**
```
npm run build
```

### **4. Preview production build**
```
npm run preview
```

---

## **PWA Setup**
This project includes:

- `manifest.json`
- Service worker for caching + offline support
- Installable app experience for officers in the field

To test PWA behavior:

1. Run `npm run build`
2. Run `npm run preview`
3. Open in Chrome → Application tab → Manifest

---

## **Supabase Integration**
The app uses:

- **Supabase Auth** for login + roles  
- **Postgres + PostGIS** for all data  
- **RLS** for agency/team‑level access control  
- **Storage** for evidence files  
- **Edge Functions** for workflows (issuing fines, payments, appeals)

All database tables and policies are defined in the `/supabase` folder (if included in your project).

---

## **GIS & Location Hierarchy**
MANTIS uses a unified hierarchical location model:

- Country  
- Division  
- Province  
- Municipal Council  
- Ward  
- Station / Office  

Each location stores a **PostGIS geometry** (Point or Polygon).  
Infringements store a GPS point and link to the resolved jurisdiction.

---

## **Development Philosophy**
MANTIS is built for:

- **APAC realities** — low bandwidth, mobile-first, offline-first  
- **Civic clarity** — simple workflows for non‑technical officers  
- **Operational discipline** — minimal dependencies, predictable behavior  
- **Scalability** — national-level enforcement with clean data governance  

---

## **Contributing**
1. Fork the repo  
2. Create a feature branch  
3. Follow the existing coding style  
4. Submit a pull request  

All contributions must respect:

- Data privacy  
- Agency separation  
- National governance requirements  

---

## **License**
This project is licensed under the MIT License unless your deployment requires a different civic/government license.