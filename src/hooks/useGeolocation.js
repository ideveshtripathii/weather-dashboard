import { useState, useEffect } from 'react';
import axios from 'axios';

const DEFAULT_LOCATION = { lat: 51.5074, lon: -0.1278, name: 'London (Default)' };

export function useGeolocation() {
  // Start with null to force loading state and ask for permission first
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      // If unsupported, load cached location or default immediately
      try {
        const saved = localStorage.getItem('weatherscope_last_location');
        setLocation(saved ? JSON.parse(saved) : DEFAULT_LOCATION);
      } catch {
        setLocation(DEFAULT_LOCATION);
      }
      return;
    }

    const success = async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const city = res.data.address.city || res.data.address.town || res.data.address.village || 'Your Location';
        const newLoc = { lat, lon, name: city };
        setLocation(newLoc);
        localStorage.setItem('weatherscope_last_location', JSON.stringify(newLoc));
      } catch {
        const newLoc = { lat, lon, name: 'Your Location' };
        setLocation(newLoc);
        localStorage.setItem('weatherscope_last_location', JSON.stringify(newLoc));
      }
    };

    const flexError = (err) => {
      // If permission is denied or failed, retrieve last cached location from localStorage
      try {
        const saved = localStorage.getItem('weatherscope_last_location');
        if (saved) {
          setLocation(JSON.parse(saved));
        } else {
          setLocation(DEFAULT_LOCATION);
        }
      } catch {
        setLocation(DEFAULT_LOCATION);
      }

      // Log warning to console, keeping UI warning boxes clean
      console.warn('Geolocation lookup info:', err.message);
    };

    // Prompt for coordinates with 15s timeout, giving the user ample time to click 'Allow'.
    navigator.geolocation.getCurrentPosition(success, flexError, { timeout: 15000, enableHighAccuracy: true });
  }, []);

  return { location, error };
}
