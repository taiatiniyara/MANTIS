# MANTIS Mobile - Testing Guide

This guide provides step-by-step instructions for testing all features of the MANTIS mobile app.

## Prerequisites

- Mobile app running on device or simulator
- Test user accounts in Supabase
- Internet connection (for online features)
- Camera access (physical device recommended)
- GPS/Location enabled

## Test Scenarios

### 1. Authentication

#### Login Test
**Steps:**
1. Open the app
2. You should see the MANTIS splash screen
3. App redirects to login screen
4. Enter test credentials:
   - Officer: `officer@mantis.fj`
   - Password: `test123`
5. Tap "Sign In"

**Expected Result:**
- Successful login
- Redirect to Officer Dashboard
- Welcome message shows user name
- Agency name displayed

#### Logout Test
**Steps:**
1. Navigate to Profile tab
2. Scroll down
3. Tap "Sign Out" button
4. Confirm sign out

**Expected Result:**
- Return to login screen
- Session cleared
- Cannot access protected screens

---

### 2. Dashboard Features

#### View Statistics
**Steps:**
1. Login as officer
2. View dashboard home screen

**Expected Result:**
- "Today" count shows today's cases
- "This Week" count shows last 7 days
- "Pending" count shows pending cases
- Recent cases list displays (up to 5)

#### Sync Status Display
**Steps:**
1. View dashboard
2. Look for sync status component (if drafts/queue exist)

**Expected Result:**
- Shows draft count if drafts exist
- Shows pending sync count if queue items exist
- Displays last sync time
- Shows "Sync" button if items pending

#### Manual Sync
**Steps:**
1. Have items in sync queue (create offline infringement first)
2. Tap "Sync" button on dashboard

**Expected Result:**
- Button shows loading indicator
- Sync completes
- Alert shows success/failure count
- Queue count updates

---

### 3. Create Infringement Flow

#### Full Create Flow - Online
**Steps:**

**Step 1: Offence Selection**
1. Tap "Create" tab
2. Browse offence list
3. Tap on an offence (e.g., "Speeding")
4. Tap "Next: Driver Details"

**Step 2: Driver Information**
1. Enter license number: `FL123456`
2. Enter full name: `John Doe`
3. Enter address: `123 Kings Road, Suva`
4. Enter DOB: `01/01/1990`
5. Tap "Next: Vehicle"

**Step 3: Vehicle Information**
1. Enter plate number: `AB1234`
2. Enter make: `Toyota`
3. Enter model: `Corolla`
4. Enter color: `Blue`
5. Tap "Next: Location"

**Step 4: Location & Description**
1. Tap "Get Location" (or it auto-captures)
2. Wait for GPS coordinates to appear
3. Enter location description: `Queens Road near Victoria Parade`
4. Enter additional notes: `Driver was going 80 in 50 zone`
5. Tap "Next: Evidence"

**Step 5: Photo Evidence**
1. Tap "📷 Take Photo"
2. Grant camera permission if prompted
3. Take a photo of violation
4. Photo appears in grid
5. Tap "🖼️ From Gallery" (optional)
6. Select additional photos
7. Tap "Review"

**Step 6: Review & Submit**
1. Verify all information is correct
2. Tap "Submit" button
3. Wait for confirmation

**Expected Result:**
- Success alert appears
- Returns to dashboard
- New case appears in recent cases
- Stats updated

#### Save as Draft
**Steps:**
1. Follow create flow steps 1-5
2. On review screen, tap "Save Draft" instead of Submit

**Expected Result:**
- Draft saved confirmation
- Returns to dashboard
- Draft appears in Drafts tab
- Sync status shows 1 draft

#### Offline Create
**Steps:**
1. Enable Airplane Mode
2. Follow full create flow
3. Submit infringement

**Expected Result:**
- Infringement saves to sync queue
- No network error
- Dashboard shows item in pending sync
- Can view in Drafts

---

### 4. Map Features

#### View Map
**Steps:**
1. Tap "Map" tab
2. Wait for map to load

**Expected Result:**
- Map displays centered on Fiji (or your location)
- Current location shows as blue marker
- Map controls visible
- Legend shows marker colors

#### View Infringements on Map
**Steps:**
1. Map screen loaded
2. Pan around map
3. Look for colored markers

**Expected Result:**
- Orange markers for pending cases
- Red markers for other statuses
- Tap marker shows case info popup
- Info box shows count of displayed cases

#### Center on Location
**Steps:**
1. Pan map away from current location
2. Tap "📍 Center" button

**Expected Result:**
- Map animates back to current location
- Centered with appropriate zoom level

---

### 5. Cases Management

#### View Cases List
**Steps:**
1. Tap "Cases" tab
2. View list of infringements

**Expected Result:**
- List of all officer's cases
- Each card shows:
  - Case ID
  - Offence code
  - Status badge
  - Date issued
  - Fine amount
- Pull-to-refresh works

#### Search Cases
**Steps:**
1. On Cases screen
2. Use search bar at top
3. Enter search term (e.g., license plate)

**Expected Result:**
- List filters as you type
- Shows only matching cases
- Clear search returns all cases

---

### 6. Drafts Management

#### View Drafts
**Steps:**
1. Tap "Drafts" tab
2. View saved drafts

**Expected Result:**
- List of all saved drafts
- Each card shows:
  - Draft ID
  - Created date
  - Offence code (if entered)
  - Location status
  - Photo count
  - DRAFT badge

#### Delete Draft
**Steps:**
1. On Drafts screen
2. Tap "Delete" on a draft
3. Confirm deletion

**Expected Result:**
- Confirmation dialog appears
- Draft removed from list
- Count updated

#### Empty State
**Steps:**
1. Delete all drafts
2. View Drafts screen

**Expected Result:**
- Empty state message displays
- Shows "No Drafts" with icon
- "Create Infringement" button shown

---

### 7. Profile Features

#### View Profile
**Steps:**
1. Tap "Profile" tab
2. View user information

**Expected Result:**
- Display name shown
- Email shown
- Role displayed
- Agency name visible
- Badge number (if set)

---

### 8. Offline Functionality

#### Create Offline, Sync Online
**Steps:**
1. Enable Airplane Mode
2. Create new infringement (save as draft or submit)
3. Disable Airplane Mode
4. Go to Dashboard
5. Tap "Sync" button

**Expected Result:**
- Case syncs to server
- Success message shown
- Case moves from queue to server
- Appears in Cases list

#### Queue Management
**Steps:**
1. Create multiple infringements offline
2. View Dashboard sync status
3. Bring device online
4. Sync all at once

**Expected Result:**
- All items sync in batch
- Summary shows success count
- Failed items remain in queue (with retry count)
- Max 3 retries per item

---

### 9. Permissions

#### Location Permission
**Steps:**
1. First launch
2. Navigate to Create or Map

**Expected Result:**
- Permission dialog appears
- "Allow While Using App" option
- If denied, shows error message
- Can still use app without location

#### Camera Permission
**Steps:**
1. On Create screen, Evidence step
2. Tap "📷 Take Photo"

**Expected Result:**
- Permission dialog appears
- Grant permission
- Camera opens
- If denied, shows error message

#### Gallery Permission
**Steps:**
1. On Create screen, Evidence step
2. Tap "🖼️ From Gallery"

**Expected Result:**
- Permission dialog appears
- Grant permission
- Gallery opens
- If denied, shows error message

---

## Bug Testing

### Common Issues to Check

1. **Network Errors**
   - What happens when network fails mid-sync?
   - Does app handle timeout gracefully?
   - Are error messages clear?

2. **Data Validation**
   - Can submit with missing required fields?
   - Are invalid inputs rejected?
   - Error messages helpful?

3. **Memory Leaks**
   - Take many photos - does app slow down?
   - Create many drafts - performance impact?
   - Browse cases - smooth scrolling?

4. **State Management**
   - Logout and login - state cleared?
   - Switch between tabs - state preserved?
   - Background and resume - data refreshed?

---

## Performance Testing

### Metrics to Track

1. **App Launch Time**
   - Cold start: < 3 seconds
   - Warm start: < 1 second

2. **Screen Load Time**
   - Dashboard: < 1 second
   - Cases list: < 2 seconds
   - Map: < 3 seconds

3. **Form Submission**
   - Create infringement: < 3 seconds (online)
   - Save draft: < 1 second (offline)

4. **Sync Performance**
   - 1 item: < 2 seconds
   - 10 items: < 10 seconds
   - 50 items: < 30 seconds

---

## User Acceptance Testing

### Officer Workflow Test

**Scenario:** Officer issues speeding ticket during patrol

1. ✅ Login to app
2. ✅ Check dashboard for stats
3. ✅ Tap Create
4. ✅ Select speeding offence
5. ✅ Scan or enter driver license
6. ✅ Enter vehicle plate
7. ✅ Capture GPS location automatically
8. ✅ Take photos of vehicle and speedometer
9. ✅ Add notes about incident
10. ✅ Review all details
11. ✅ Submit infringement
12. ✅ Confirm submission
13. ✅ View in cases list

**Success Criteria:**
- Complete flow in < 3 minutes
- No confusing steps
- All data saved correctly
- Officer confident in process

---

## Regression Testing

After code changes, verify:

- [ ] Login still works
- [ ] Dashboard loads correctly
- [ ] Create flow completes
- [ ] Map displays properly
- [ ] Offline sync functions
- [ ] Drafts save and load
- [ ] Cases list populates
- [ ] Profile displays data
- [ ] All tabs navigate correctly
- [ ] Logout clears session

---

## Test Data

### Test Accounts
```
Officer 1:
Email: officer1@mantis.fj
Password: test123

Officer 2:
Email: officer2@mantis.fj
Password: test123

Team Leader:
Email: leader@mantis.fj
Password: test123
```

### Sample Data
```
Driver Licenses: FL123456, FL789012, FL345678
Vehicle Plates: AB1234, CD5678, EF9012
Offence Codes: SPEED-001, PARK-001, DRUNK-001
```

---

## Reporting Issues

When reporting bugs, include:

1. **Device Info**
   - OS: iOS/Android
   - Version: X.X.X
   - Device: iPhone/Pixel/etc

2. **Steps to Reproduce**
   - Numbered list of exact steps
   - What you expected
   - What actually happened

3. **Screenshots/Videos**
   - Visual evidence of issue
   - Error messages

4. **Logs**
   - Console output
   - Network requests
   - Error stack traces

---

## Success Criteria

The app passes testing if:

✅ All authentication flows work
✅ Can create infringement end-to-end
✅ Offline mode saves and syncs correctly
✅ Maps display location and markers
✅ Drafts can be saved and managed
✅ Cases list loads and filters
✅ No crashes during normal use
✅ Performance meets benchmarks
✅ Error handling is graceful
✅ UI is intuitive and responsive

---

## Next Phase Testing

Once core features pass:

1. **Load Testing** - Many concurrent users
2. **Security Testing** - Authentication, data access
3. **Accessibility Testing** - Screen readers, voice control
4. **Localization Testing** - Multiple languages
5. **Battery Testing** - GPS/camera impact
6. **Data Usage Testing** - Network efficiency
