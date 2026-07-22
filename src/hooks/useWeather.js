import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

export function useWeather(lat, lon, date) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const refetch = () => setRetryCount(prev => prev + 1);

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const targetDate = date ? dayjs(date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
        
        const [weatherRes, airRes] = await Promise.all([
          axios.get(`https://api.open-meteo.com/v1/forecast`, {
            timeout: 10000,
            params: {
              latitude: lat,
              longitude: lon,
              current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code',
              hourly: 'temperature_2m,relative_humidity_2m,precipitation,visibility,wind_speed_10m',
              daily: 'temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max',
              timezone: 'auto',
              start_date: targetDate,
              end_date: targetDate
            }
          }),
          axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality`, {
            timeout: 10000,
            params: {
              latitude: lat,
              longitude: lon,
              current: 'european_aqi,pm10,pm2_5,carbon_monoxide,carbon_dioxide,nitrogen_dioxide,sulphur_dioxide,ozone',
              hourly: 'pm10,pm2_5',
              timezone: 'auto',
              start_date: targetDate,
              end_date: targetDate
            }
          })
        ]);

        setData({
          weather: weatherRes.data,
          airQuality: airRes.data
        });
      } catch (err) {
        if (err.code === 'ECONNABORTED') {
          setError("Request timed out. The weather service took too long to respond.");
        } else if (err.response?.status === 503) {
          setError("The weather service is temporarily busy/overloaded. Please try again.");
        } else {
          setError(err.response?.data?.reason || err.message || "Failed to fetch weather data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon, date, retryCount]);

  return { data, loading, error, refetch };
}

export function useHistoricalWeather(lat, lon, startDate, endDate) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const refetch = () => setRetryCount(prev => prev + 1);

  useEffect(() => {
    if (!lat || !lon || !startDate || !endDate) return;

    const fetchHistorical = async () => {
      setLoading(true);
      setError(null);
      try {
        const sTime = dayjs(startDate).format('YYYY-MM-DD');
        const eTime = dayjs(endDate).format('YYYY-MM-DD');

        const [weatherRes, airRes] = await Promise.all([
          axios.get(`https://archive-api.open-meteo.com/v1/archive`, {
            timeout: 10000,
            params: {
              latitude: lat,
              longitude: lon,
              daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,sunrise,sunset,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant',
              timezone: 'Asia/Kolkata',
              start_date: sTime,
              end_date: eTime
            }
          }).catch(() => ({ data: {} })), // Fallback logic if archive fails
          axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality`, {
            timeout: 10000,
            params: {
              latitude: lat,
              longitude: lon,
              hourly: 'pm10,pm2_5',
              timezone: 'Asia/Kolkata',
              start_date: sTime,
              end_date: eTime
            }
          }).catch(() => ({ data: {} }))
        ]);

        setData({
          weather: weatherRes.data,
          airQuality: airRes.data
        });
      } catch (err) {
        if (err.code === 'ECONNABORTED') {
          setError("Request timed out. The weather service took too long to respond.");
        } else if (err.response?.status === 503) {
          setError("The weather service is temporarily busy/overloaded. Please try again.");
        } else {
          setError(err.response?.data?.reason || err.message || "Failed to fetch historical data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistorical();
  }, [lat, lon, startDate, endDate, retryCount]);

  return { data, loading, error, refetch };
}
