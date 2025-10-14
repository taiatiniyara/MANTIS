# 📱 Create Infringement Form - User Guide

## Overview
The Create Infringement form allows officers to quickly issue traffic infringements from their mobile devices. The form is designed for speed and accuracy in the field.

---

## 🎯 Quick Start (3 Required Fields)

To create an infringement, you only need 3 things:
1. **Vehicle Registration** ← Search to verify
2. **Offence** ← Select from list  
3. **Location** ← Describe where it happened

Everything else is optional!

---

## 📝 Field-by-Field Guide

### 1. Vehicle Registration Number ⭐ REQUIRED
**What it does**: Looks up the vehicle in the system

**How to use**:
1. Type the registration number (e.g., "AB1234")
2. Tap the blue search button (🔍)
3. Wait for the result:
   - **✅ Green card**: Vehicle found! Shows make/model/color
   - **⚠️ Yellow card**: Vehicle not in system (we'll create it)

**Tips**:
- Don't worry about uppercase/lowercase - we handle it
- If vehicle not found, that's okay - we'll add it automatically
- The search happens instantly

---

### 2. Driver Licence Number (Optional)
**What it does**: Records the driver's licence if known

**How to use**:
- Simply type the licence number if you have it
- It's okay to leave this blank

**Tips**:
- Not all infringements will have this
- Use if driver shown their licence

---

### 3. Offence ⭐ REQUIRED
**What it does**: Selects which traffic law was broken

**How to use**:
1. Tap "Select an offence" button
2. A list of offences appears
3. Scroll to find the right one
4. Tap to select
5. The button now shows your selection with the fine amount

**What you'll see**:
- **Code**: Like "T01" or "P05"
- **Description**: What the offence is
- **Category**: Type of offence (e.g., "traffic", "parking")
- **Fine Amount**: How much in dollars

**Tips**:
- Common offences are at the top
- Fine amount shows on the right
- Selected offence turns blue
- Tap again to change selection

---

### 4. Location ⭐ REQUIRED
**What it does**: Records where the infringement happened

**How to use**:
- Type a clear description of the location
- Be specific enough for the driver to know where
- Example: "Kings Road near Suva Market" ✅
- Bad example: "Road" ❌

**Tips**:
- Include landmarks if possible
- Mention road names
- Note direction if helpful (e.g., "northbound")
- GPS coordinates coming in next update!

---

### 5. Notes (Optional)
**What it does**: Records any additional observations

**How to use**:
- Type anything relevant that doesn't fit elsewhere
- Examples:
  - "Driver was apologetic"
  - "Rainy conditions"
  - "Traffic was heavy"
  - "Vehicle had expired WOF sticker"

**Tips**:
- This field helps explain context
- Useful for disputes later
- Not required, but recommended

---

## 🚀 Submitting the Form

### When you're ready:
1. Review all your entries
2. Tap the blue "Create Infringement" button at the bottom
3. The system will:
   - ✅ Check all required fields are filled
   - ✅ Create or find the vehicle
   - ✅ Generate a unique infringement number
   - ✅ Record your officer details automatically
   - ✅ Save everything to the database

### What happens after:
- You'll see a "Success" message
- The form clears ready for the next one
- You're taken to the infringements list
- The driver will be notified (coming soon)

---

## ⚠️ Common Validation Errors

### "Please enter a registration number"
→ You forgot to fill in the vehicle registration field

### "Please select an offence"
→ You need to choose which law was broken from the list

### "Please enter a location"
→ You need to describe where this happened

---

## 💡 Pro Tips

### Speed Tips:
1. **Start typing reg number** as you approach the vehicle
2. **Tap search** while talking to driver
3. **Select offence** from memory (learn common codes)
4. **Use voice typing** for location (if available)
5. **Skip optional fields** to save time

### Accuracy Tips:
1. **Double-check registration** before searching
2. **Verify vehicle details** match what you see
3. **Choose correct offence code** - fine amounts differ!
4. **Be specific with location** - helps drivers remember
5. **Add notes** for anything unusual

### Field Work Tips:
1. **Complete form immediately** while memory is fresh
2. **Don't wait** until end of shift
3. **Take photo of vehicle** (camera feature coming soon!)
4. **Get GPS location** (GPS feature coming soon!)
5. **Work offline** if needed (offline mode coming soon!)

---

## 🔄 What Happens Behind the Scenes

When you submit, the app automatically:

1. **Creates vehicle record** (if new)
2. **Generates infringement number** (e.g., "INF-2025-001234")
3. **Records your officer ID** (from your login)
4. **Records your agency** (Police, LTA, etc.)
5. **Sets status to "issued"**
6. **Sets fine amount** (from offence database)
7. **Records timestamp** (when you submitted)
8. **Saves to database** (syncs to cloud)

All this happens in about 1 second!

---

## 📱 Screen Layout

```
┌─────────────────────────────────┐
│  Create Infringement            │  ← Header
│  Issue a new traffic infringement│
├─────────────────────────────────┤
│                                 │
│  Vehicle Information            │  ← Section 1
│  ┌─────────────────┬─────┐     │
│  │ AB1234          │  🔍  │     │  ← Registration + Search
│  └─────────────────┴─────┘     │
│  ┌─────────────────────────┐   │
│  │ ✅ AB1234              │   │  ← Vehicle Found
│  │    Toyota Corolla 2018  │   │
│  │    Color: White         │   │
│  └─────────────────────────┘   │
│                                 │
│  Driver Licence Number          │  ← Section 2
│  ┌─────────────────────────┐   │
│  │ Optional                │   │
│  └─────────────────────────┘   │
│                                 │
│  Offence *                      │  ← Section 3
│  ┌─────────────────────────┐   │
│  │ T01                     ▼ │  ← Picker (tap to expand)
│  │ Speeding                │   │
│  │ Fine: $150.00           │   │
│  └─────────────────────────┘   │
│                                 │
│  Location *                     │  ← Section 4
│  ┌─────────────────────────┐   │
│  │ Kings Road near Suva    │   │
│  │ Market                  │   │
│  └─────────────────────────┘   │
│                                 │
│  Notes                          │  ← Section 5
│  ┌─────────────────────────┐   │
│  │ Additional notes...     │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ➕ Create Infringement  │   │  ← Submit Button
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

## 🎓 Training Scenarios

### Scenario 1: Speeding Vehicle (All Details Known)
1. Registration: "CD5678"
2. Search → Vehicle found ✅
3. Driver Licence: "123456"
4. Offence: "T01 - Speeding" → $150
5. Location: "Queens Road near Nadi Airport, northbound"
6. Notes: "Clocked at 110km/h in 80km/h zone. Driver admitted speeding."
7. Submit → Success!

### Scenario 2: Unknown Vehicle (Parking)
1. Registration: "XY9999"
2. Search → Not found ⚠️ (will be created)
3. Driver Licence: (leave blank - driver not present)
4. Offence: "P03 - Illegal Parking" → $50
5. Location: "Victoria Parade, parked in No Parking zone"
6. Notes: "Vehicle unattended"
7. Submit → Success!

### Scenario 3: Quick Issue (Minimum Fields)
1. Registration: "AB1234"
2. Search → ✅
3. Offence: "T05 - No Seatbelt" → $100
4. Location: "Rewa Street, Suva"
5. Submit → Success!
   (Only took 30 seconds!)

---

## ❓ FAQ

**Q: What if I make a mistake?**
A: You can void infringements later from the infringements list.

**Q: Can I create infringements offline?**
A: Not yet, but offline mode is coming in the next update!

**Q: Do I need to take photos?**
A: Not required yet, but camera integration is coming soon.

**Q: What if the vehicle isn't in the system?**
A: That's fine! We'll create a new vehicle record automatically.

**Q: Can I edit an infringement after creating it?**
A: Not directly from this form. Use the infringements list to view/modify.

**Q: How do I know it saved?**
A: You'll see a success message, and it appears in your infringements list.

**Q: What if I lose connection while submitting?**
A: Currently shows an error. Offline support coming soon!

**Q: Can citizens use this form?**
A: No, only officers and agency admins see the create button.

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to search vehicle" | Check internet connection |
| "Failed to load offences" | Reload the screen |
| "Failed to create infringement" | Check all required fields |
| Form is slow | Check network signal strength |
| Can't see offence list | Tap the picker button to expand |
| Keyboard covers form | Scroll down or dismiss keyboard |
| Button doesn't work | Wait for previous action to complete |

---

## 📞 Need Help?

- **Can't find an offence?** → Contact your supervisor
- **Technical problems?** → Contact IT support  
- **Question about procedures?** → Refer to training manual

---

**Version**: 1.0  
**Last Updated**: October 13, 2025  
**Next Update**: Camera integration + GPS location
