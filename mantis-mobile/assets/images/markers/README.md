# Custom Map Markers - Asset Creation Guide

## 📍 Marker Assets Needed

For Phase 4 Sprint 1, we need custom marker images for different infringement statuses.

### Required Markers (4 total)

1. **marker-issued.png** - Orange marker for issued infringements
2. **marker-paid.png** - Green marker for paid infringements  
3. **marker-disputed.png** - Blue marker for disputed infringements
4. **marker-voided.png** - Gray marker for voided infringements

---

## 🎨 Design Specifications

### Size
- **Dimensions:** 120x120 pixels (3x for Retina displays)
- **Export as PNG** with transparency
- **File size:** < 50KB each

### Style
- Modern, flat design
- Clear visibility on both light and dark maps
- Drop shadow for depth
- Simple, recognizable shape

### Colors

| Status | Color | Hex Code |
|--------|-------|----------|
| Issued | Orange | #F97316 |
| Paid | Green | #10B981 |
| Disputed | Blue | #3B82F6 |
| Voided | Gray | #6B7280 |

---

## 🖼️ Design Options

### Option 1: Pin-style Marker
Classic map pin shape with rounded top and pointed bottom.

```
    ●●●
   ●●●●●
  ●●●●●●●
  ●●●●●●●
   ●●●●●
    ●●●
     ●
     ●
    ●●●
```

### Option 2: Circle Marker
Simple circle with border and inner icon/number.

```
   ●●●●●
  ●●   ●●
 ●●  #  ●●
 ●●     ●●
  ●●   ●●
   ●●●●●
```

### Option 3: Badge Marker
Shield or badge shape with status indicator.

```
   ●●●●●
  ●●●●●●●
  ●●●●●●●
  ●●●●●●●
   ●●●●●
    ●●●
```

**Recommendation:** Option 1 (Pin-style) is most recognizable and works best on maps.

---

## 📐 SVG Template

Here's an SVG template you can customize for each status:

```xml
<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
  <!-- Drop shadow -->
  <defs>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Main pin shape -->
  <g filter="url(#shadow)">
    <!-- Outer circle -->
    <circle cx="60" cy="45" r="25" fill="#F97316" stroke="white" stroke-width="3"/>
    
    <!-- Inner icon/number -->
    <text x="60" y="53" font-size="24" font-weight="bold" 
          fill="white" text-anchor="middle">!</text>
    
    <!-- Pin point -->
    <path d="M60 70 L50 90 L60 95 L70 90 Z" fill="#F97316"/>
  </g>
</svg>
```

Change `#F97316` to the appropriate color for each status.

---

## 🛠️ Quick Creation Methods

### Method 1: Use Online Tools
1. Go to https://www.figma.com or https://www.canva.com
2. Create 120x120px canvas
3. Draw pin shape with appropriate color
4. Export as PNG

### Method 2: Use Emoji + Text
For quick prototyping:
- 📍 Red/Orange pin emoji (Issued)
- ✅ Green check mark (Paid)
- ⚠️ Yellow warning (Disputed)
- ⭕ Gray circle (Voided)

Save these as images using screenshot or emoji-to-image converter.

### Method 3: Use React Native Vector Icons
Instead of images, use icon fonts:

```tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';

<MaterialCommunityIcons 
  name="map-marker" 
  size={40} 
  color="#F97316" 
/>
```

**Recommendation:** Start with Method 3 (Vector Icons) for development, then create custom images for production.

---

## 📱 Implementation in Code

### Using Image Assets

```tsx
import { Image } from 'react-native';

// In marker component
<Marker coordinate={{latitude, longitude}}>
  <Image 
    source={require('@/assets/images/markers/marker-issued.png')}
    style={{ width: 40, height: 40 }}
  />
</Marker>
```

### Using Status-based Colors

```tsx
const getMarkerColor = (status: string) => {
  switch(status) {
    case 'issued': return '#F97316';
    case 'paid': return '#10B981';
    case 'disputed': return '#3B82F6';
    case 'voided': return '#6B7280';
    default: return '#F97316';
  }
};

<Marker 
  coordinate={{latitude, longitude}}
  pinColor={getMarkerColor(infringement.status)}
/>
```

---

## ✅ Temporary Solution (For Now)

Since we don't have the image files yet, we can use:

1. **Default pin colors** - Use `pinColor` prop with status colors
2. **Vector icons** - Use @expo/vector-icons 
3. **Custom View component** - Create marker with styled View

Example custom marker:

```tsx
<Marker coordinate={{latitude, longitude}}>
  <View style={styles.customMarker}>
    <View style={[styles.markerCircle, { backgroundColor: color }]}>
      <Text style={styles.markerText}>!</Text>
    </View>
    <View style={[styles.markerTriangle, { borderTopColor: color }]} />
  </View>
</Marker>

const styles = StyleSheet.create({
  customMarker: {
    alignItems: 'center',
  },
  markerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  markerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});
```

---

## 📋 Action Items

- [ ] Decide on marker style (Pin/Circle/Badge)
- [ ] Create 4 PNG files (120x120px each)
- [ ] Place in `assets/images/markers/` directory
- [ ] Update components to use custom markers
- [ ] Test on iOS and Android
- [ ] Optimize file sizes

**Status:** 📋 Pending - Using vector icons/default colors for now

---

**Created:** October 13, 2025  
**For Sprint:** Phase 4 Sprint 1 - Google Maps Mobile Integration  
**Priority:** Medium (not blocking development)
