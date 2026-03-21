import React, { useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useWeather } from '../hooks/useWeather';
import { WeatherCards } from '../components/WeatherCards';
import { HourlyCharts } from '../components/HourlyCharts';
import dayjs from 'dayjs';
import { MapPin, Calendar, Activity, Loader2 } from 'lucide-react';

export default function CurrentWeather() {
  const { location, error: geoError } = useGeolocation();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [isFahrenheit, setIsFahrenheit] = useState(false);

  const { data, loading, error: weatherError } = useWeather(
    location?.lat,
    location?.lon,
    selectedDate
  );

  if (!location) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center space-x-2 text-brand-400 mb-2">
            <MapPin className="w-5 h-5" />
            <h2 className="font-semibold text-lg">{location.name}</h2>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Current Weather
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsFahrenheit(!isFahrenheit)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            {isFahrenheit ? 'Switch to °C' : 'Switch to °F'}
          </button>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow appearance-none color-scheme-dark"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      </header>

      {geoError && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl text-yellow-500 text-sm">
          Warning: {geoError}. Displaying default location.
        </div>
      )}

      {weatherError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
          Error loading weather: {weatherError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : data ? (
        <>
          <WeatherCards weatherData={data.weather} airData={data.airQuality} isFahrenheit={isFahrenheit} />
          <HourlyCharts weatherData={data.weather} airData={data.airQuality} isFahrenheit={isFahrenheit} />
        </>
      ) : null}
    </div>
  );
}
