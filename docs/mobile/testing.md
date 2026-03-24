# MANTIS Mobile - Testing Guide

This guide covers practical test passes for the current mobile implementation.

## Prerequisites

- Mobile app running (`npm run start`)
- Valid Supabase test users
- One physical device for camera/GPS verification (recommended)

---

## 1) Authentication

### Login
1. Open app and navigate to login.
2. Enter valid credentials.
3. Submit.

Expected:
- Successful navigation to role-appropriate dashboard.
- No duplicate submit behavior on repeated taps.
- Accessible announcements for validation and loading states.

### Password Reset
1. Open “Forgot Password”.
2. Enter valid email.
3. Submit reset request.

Expected:
- Confirmation alert shown.
- Accessibility announcements for validation/loading.

---

## 2) Officer Create Flow

Path: `Create` tab

### Happy Path (Online)
1. Select offence.
2. Enter driver license.
3. Enter vehicle plate.
4. Pick location via map / GPS.
5. Add at least one photo.
6. Review and submit.

Expected:
- Success alert and form reset.
- Case visible in officer cases list.

### Draft Path
1. Follow same steps.
2. Use “Save Draft”.

Expected:
- Draft appears in Drafts list.
- Draft can be reopened for editing.

### Offline Queue Path
1. Enable offline mode / disable network.
2. Submit case.

Expected:
- Queued-for-sync confirmation.
- Sync count updates in profile/dashboard sync indicators.

---

## 3) Cases List + Details

Path: `Cases` tab (Officer)

### List Behavior
- Search by offence code.
- Switch filters (`all`, `draft`, `submitted`, `pending`, `approved`).
- Pull to refresh.

Expected:
- Filter/search update list correctly.
- Refresh works and avoids duplicate triggers.

### Case Details Modal
1. Open a case.
2. Verify sections (offence, date/time, location, evidence).
3. Check driver and vehicle sections when IDs exist.

Expected:
- Driver license loads from `drivers` table.
- Vehicle plate loads from `vehicles` table.
- Fallback shows `Unavailable` if record missing.

---

## 4) Drafts

Path: `Drafts` tab (Officer)

- Refresh list.
- Edit draft.
- Delete draft and confirm.

Expected:
- Deletion updates list and count.
- Duplicate delete taps are safely handled.

---

## 5) Profile + Sync

Path: `Profile` tab (Officer)

- Run manual sync with pending queue.
- Toggle offline mode.
- Toggle biometric option (if hardware/enrollment available).
- Clear sync queue / clear drafts.
- Sign out.

Expected:
- Busy states and accessibility announcements are present.
- Sign out cannot be double-triggered.

---

## 6) Accessibility Regression Pass

Validate on key screens (`login`, `create`, `cases`, `drafts`, `profile`):

- All primary actions have spoken labels.
- Busy/disabled state is announced for submit/sync actions.
- Inputs have meaningful accessibility labels.
- Controls remain >= 44dp touch targets.

---

## 7) Tab Bar Visual Check

Validate officer and leader tab bars on target devices:

- Icon and label are vertically aligned.
- No left/right drift on active `Home` tab.
- Haptic feedback triggers on tab press (non-web).

---

## 8) Suggested Pre-Release Smoke Checklist

- `npm run lint` passes
- App launches on iOS simulator and Android emulator
- Create + submit case works end-to-end
- Case details show driver/vehicle data when linked
- Offline queue and manual sync verified once
- Sign-in/sign-out flows verified
