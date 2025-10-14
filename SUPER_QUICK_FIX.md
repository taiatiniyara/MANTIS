# 🚀 SUPER QUICK FIX - 3 Steps

## The Error
```
Failed to create user profile: new row for relation "users" 
violates check constraint "users_officer_must_have_agency"
```

## The Fix (5 Minutes)

### 1️⃣ Copy SQL Script
Open: `complete-system-init-setup.sql`

### 2️⃣ Run in Supabase
1. Go to **Supabase Dashboard**
2. Click **SQL Editor**
3. Paste the complete script
4. Click **Run** (green play button)
5. Wait for "✅ SUCCESS! Setup Complete"

### 3️⃣ Test in Browser
```javascript
// Clear cache in browser console (F12)
localStorage.clear();
location.reload();
```

Then:
- Navigate to login page
- Click "Initialize System"
- ✅ Should work!

---

## What It Does

The script:
- ✅ Fixes database constraint
- ✅ Creates initialization functions
- ✅ Verifies everything works
- ✅ Shows success message

## One-Liner
```
Copy complete-system-init-setup.sql → Paste in Supabase → Run → Clear cache → Test
```

---

**That's it!** 🎉

---

## Still Having Issues?

### Error: "System already initialized"
**Fix**: Delete existing users first
```sql
DELETE FROM users;
```

### Error: "Permission denied"
**Fix**: Make sure you're logged in as database owner in Supabase

### Error: Functions not found
**Fix**: Make sure the script ran successfully (check for error messages)

---

## Files You Need

| File | Purpose |
|------|---------|
| **`complete-system-init-setup.sql`** | ⭐ **USE THIS ONE** - Does everything |
| `FIX_CONSTRAINT_GUIDE.md` | Detailed documentation |
| `QUICK_FIX_RLS.md` | Previous RLS fix info |

---

**Time Required**: ~5 minutes  
**Difficulty**: 🟢 Easy (just copy & paste!)  
**Risk**: 🟢 Low (safe constraint fix)
