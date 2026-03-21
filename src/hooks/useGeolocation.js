import { useState, useEffect } from 'react';
import axios from 'axios';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocation({ lat: 51.5074, lon: -0.1278, name: 'London (Default)' });
      return;
    }

    const success = async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const city = res.data.address.city || res.data.address.town || res.data.address.village || 'Your Location';
        setLocation({ lat, lon, name: city });
      } catch {
        setLocation({ lat, lon, name: 'Your Location' });
      }
    };

    const flexError = (err) => {
      setError(err.message);
      setLocation({ lat: 51.5074, lon: -0.1278, name: 'London (Default)' });
    };

    navigator.geolocation.getCurrentPosition(success, flexError);
  }, []);

  return { location, error };
}
