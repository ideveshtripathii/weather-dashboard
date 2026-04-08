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
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-700 zoom-in-[0.98]">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 realistic-card p-8 group">
        <div>
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-medium tracking-wide">
            <MapPin className="w-5 h-5 text-zinc-300" />
            <h2 className="text-sm uppercase tracking-widest">{location.name}</h2>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
            Current Weather
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-black/20 p-2 rounded-2xl border border-white/5">
          <button
            onClick={() => setIsFahrenheit(!isFahrenheit)}
            className="px-5 py-2.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-xl text-sm font-semibold text-zinc-200 transition-all hover:shadow-lg hover:shadow-white/5 cursor-pointer"
          >
            {isFahrenheit ? 'Switch to °C' : 'Switch to °F'}
          </button>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-11 pr-5 py-2.5 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-xl text-sm font-semibold text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500/30 transition-all appearance-none cursor-pointer"
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
