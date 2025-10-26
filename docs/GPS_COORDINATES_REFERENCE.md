# GPS Coordinates Quick Reference for Fiji

## 🗺️ Major Cities & Towns

### Viti Levu (Main Island)

**Suva (Capital)**
- Latitude: `-18.1416`
- Longitude: `178.4419`
- Government Buildings, Central Police HQ

**Nadi**
- Latitude: `-17.8000`
- Longitude: `177.4167`
- International Airport, Tourism Hub

**Lautoka**
- Latitude: `-17.6161`
- Longitude: `177.4500`
- Sugar City, Second Largest City

**Nasinu**
- Latitude: `-18.0500`
- Longitude: `178.5500`
- Greater Suva Area

**Nausori**
- Latitude: `-18.0333`
- Longitude: `178.5500`
- Domestic Airport

---

## 🏝️ Vanua Levu (Second Island)

**Labasa**
- Latitude: `-16.4167`
- Longitude: `179.3833`
- Largest Town on Vanua Levu

**Savusavu**
- Latitude: `-16.7833`
- Longitude: `179.3333`
- Tourism, Hidden Paradise

---

## 🏛️ Key Government Buildings

**Government House, Suva**
- Latitude: `-18.1388`
- Longitude: `178.4244`

**Parliament of Fiji**
- Latitude: `-18.1415`
- Longitude: `178.4296`

**Suva Civic Centre**
- Latitude: `-18.1447`
- Longitude: `178.4425`

---

## 🚔 Police Divisions/Stations

### Central Division
**Suva Police Station**
- Latitude: `-18.1416`
- Longitude: `178.4419`

**Nasinu Police Station**
- Latitude: `-18.0500`
- Longitude: `178.5500`

### Western Division
**Lautoka Police Station**
- Latitude: `-17.6161`
- Longitude: `177.4500`

**Nadi Police Station**
- Latitude: `-17.8000`
- Longitude: `177.4167`

### Northern Division
**Labasa Police Station**
- Latitude: `-16.4167`
- Longitude: `179.3833`

---

## 🛣️ Major Roads & Highways

**Kings Road (Suva Section)**
- Start: `-18.1416, 178.4419`
- Major arterial road

**Queens Road (Southern Route)**
- Major highway connecting Suva to Nadi

**Princes Road (Suva)**
- Victoria Parade area
- Latitude: `-18.1447`
- Longitude: `178.4425`

---

## 🌊 Coastal Areas

**Suva Harbour**
- Latitude: `-18.1333`
- Longitude: `178.4333`

**Denarau Island**
- Latitude: `-17.7833`
- Longitude: `177.3833`

---

## 📍 How to Use These Coordinates

### In MANTIS System

1. **Create Location:**
   ```
   Name: Suva Police Station
   Type: Station
   Latitude: -18.1416
   Longitude: 178.4419
   ```

2. **Create Route:**
   ```
   Name: Suva Downtown Patrol
   Start: Suva Police Station (-18.1416, 178.4419)
   End: Civic Centre (-18.1447, 178.4425)
   ```

### Finding Custom Coordinates

**Google Maps Method:**
1. Open Google Maps
2. Right-click on desired location
3. Click coordinates at top of menu
4. Format: `XX.XXXX, XXX.XXXX`
5. First number = Latitude
6. Second number = Longitude

**Mobile Device:**
1. Long-press location in Google Maps
2. Coordinates appear at top
3. Tap to copy
4. Paste into MANTIS location form

---

## 🎯 Coordinate Format Guide

### Decimal Degrees (Used by MANTIS)
```
Latitude:  -18.1416  (2 digits, 4 decimal places)
Longitude: 178.4419  (3 digits, 4 decimal places)
```

### Fiji Coordinate Ranges
```
Latitude:  -15° to -21°  (South of Equator)
Longitude: 177° to 180°  (East of Prime Meridian)
```

### Validation Rules
- Latitude: `-90` to `90`
- Longitude: `-180` to `180`
- Fiji specific: Lat `-15` to `-21`, Lon `177` to `180`

---

## 📱 Mobile Officer Field Collection

### Using GPS on Phone

**iPhone:**
1. Settings → Privacy → Location Services → ON
2. Open Compass app
3. Current coordinates shown at bottom
4. Tap to copy

**Android:**
1. Open Google Maps
2. Tap blue dot (your location)
3. View coordinates
4. Share or copy

### Field Notes Template
```
Location: _________________
Type: ___________________
Latitude: ________________
Longitude: _______________
Address: _________________
Date: ____________________
Officer: _________________
```

---

## 🗺️ Coverage Area Planning

### Typical Patrol Route Spacing

**Urban Areas (Suva, Lautoka, Nadi):**
- Route spacing: 0.5-1 km
- Coordinate increment: ~0.005°

**Suburban Areas:**
- Route spacing: 1-2 km
- Coordinate increment: ~0.01°

**Rural Areas:**
- Route spacing: 5-10 km
- Coordinate increment: ~0.05°

### Sample Route Grid (Suva Downtown)

```
North Boundary:  -18.1300, 178.4300
South Boundary:  -18.1500, 178.4300
East Boundary:   -18.1400, 178.4500
West Boundary:   -18.1400, 178.4300
```

---

## 🎓 Training Examples

### Example 1: Police Station
```
Name: Nasinu Police Station
Type: Station
Address: Nasinu Town, Fiji
Latitude: -18.0500
Longitude: 178.5500
```

### Example 2: Patrol Post
```
Name: Rewa Bridge Post
Type: Post
Address: Kings Road, Rewa
Latitude: -18.0700
Longitude: 178.5200
```

### Example 3: Patrol Route
```
Name: Morning Coastal Patrol
Description: Daily morning patrol along coast
Start: Suva Police Station (-18.1416, 178.4419)
End: Rewa Bridge Post (-18.0700, 178.5200)
Distance: ~13 km
```

---

## 🔍 Accuracy Levels

### Decimal Places → Accuracy

| Decimals | Accuracy | Use Case |
|----------|----------|----------|
| 0 | ~111 km | Country level |
| 1 | ~11 km | City level |
| 2 | ~1.1 km | District |
| 3 | ~110 m | Neighborhood |
| **4** | **~11 m** | **Street level** ✓ |
| 5 | ~1.1 m | Building |
| 6 | ~0.11 m | Precise surveying |

**MANTIS uses 4 decimal places = Street-level accuracy**

---

## 📊 Coordinate Conversion Tools

### Online Converters
- [GPS Visualizer](https://www.gpsvisualizer.com/calculators)
- [FCC DMS-Decimal Converter](https://www.fcc.gov/media/radio/dms-decimal)

### Format Examples

**DMS (Degrees, Minutes, Seconds):**
```
18°08'29.8"S 178°26'30.8"E
```

**Decimal Degrees (MANTIS Format):**
```
-18.1416, 178.4419
```

### Conversion Formula
```
Decimal = Degrees + (Minutes/60) + (Seconds/3600)
```

---

## 📞 Support Resources

### Need Help?
1. Check location on Google Maps first
2. Verify coordinates are in Fiji range
3. Use 4 decimal places
4. Add negative sign for South latitude
5. Contact system admin if issues persist

### Common Issues

**Invalid Coordinates:**
- Check decimal vs DMS format
- Verify negative sign for South
- Ensure within valid range

**Wrong Location on Map:**
- Swap latitude/longitude if backwards
- Check decimal point position
- Verify against Google Maps

---

*Last Updated: October 22, 2025*
*Quick Reference for MANTIS Route Mapping*
