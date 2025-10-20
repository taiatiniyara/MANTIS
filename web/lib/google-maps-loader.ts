// Singleton loader for Google Maps API
// Prevents multiple script injections and "included multiple times" error

declare global {
  interface Window {
    google: any;
    googleMapsLoaded?: boolean;
  }
}

let loadingPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  // If already loaded, resolve immediately
  if (window.googleMapsLoaded && window.google?.maps) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  loadingPromise = new Promise<void>((resolve, reject) => {
    // Check if script already exists in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Script exists, wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkLoaded);
          window.googleMapsLoaded = true;
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!window.google?.maps) {
          reject(new Error("Google Maps script loading timeout"));
        }
      }, 10000);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    
    if (!apiKey) {
      reject(new Error("Google Maps API key is not configured"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,visualization`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      window.googleMapsLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      loadingPromise = null; // Reset on error so it can be retried
      reject(new Error("Failed to load Google Maps script"));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
};

// Check if Google Maps is already loaded
export const isGoogleMapsLoaded = (): boolean => {
  return !!(window.googleMapsLoaded && window.google?.maps);
};
