import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface OSMMapProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
}

const OSMMap: React.FC<OSMMapProps> = ({ 
  initialLat = 37.7749, 
  initialLng = -122.4194,
  onLocationSelect 
}) => {
  const webViewRef = useRef<WebView>(null);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapClick') {
        console.log('Map clicked at:', data.lat, data.lng);
        if (onLocationSelect) {
          onLocationSelect(data.lat, data.lng);
        }
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
        }
        #map {
          height: 100%;
          width: 100%;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Fix Leaflet's default icon paths for WebView
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Initialize map centered on user location
        const map = L.map('map').setView([${initialLat}, ${initialLng}], 13);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        // Keep track of the current marker
        let currentMarker = null;

        // Add initial marker at user location
        currentMarker = L.marker([${initialLat}, ${initialLng}]).addTo(map);

        // Listen for messages from React Native
        document.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'goToCoordinates') {
              // Pan to coordinates
              map.setView([data.lat, data.lng], 13);
              
              // Remove old marker if exists
              if (currentMarker) {
                map.removeLayer(currentMarker);
              }
              
              // Add new marker
              currentMarker = L.marker([data.lat, data.lng]).addTo(map);
            }
          } catch (error) {
            console.error('Error handling message:', error);
          }
        });

        // For iOS
        window.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'goToCoordinates') {
              map.setView([data.lat, data.lng], 13);
              
              if (currentMarker) {
                map.removeLayer(currentMarker);
              }
              
              currentMarker = L.marker([data.lat, data.lng]).addTo(map);
            }
          } catch (error) {
            console.error('Error handling message:', error);
          }
        });

        // Listen for map clicks and send coordinates back to React Native
        map.on('click', function(e) {
          // Remove old marker if exists
          if (currentMarker) {
            map.removeLayer(currentMarker);
          }
          
          // Add new marker at clicked location
          currentMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
          
          const message = JSON.stringify({
            type: 'mapClick',
            lat: e.latlng.lat,
            lng: e.latlng.lng
          });
          
          // Send message to React Native
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(message);
          }
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default OSMMap;
