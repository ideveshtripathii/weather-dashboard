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

  const { data, loading, error: weatherError, refetch } = useWeather(
    location?.lat,
    location?.lon,
    selectedDate
  );

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  if (!location) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-700 zoom-in-[0.98]">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12 realistic-card p-6 sm:p-8 group">
        <div>
          <div className="flex items-center space-x-2 text-slate-400 mb-2 font-medium tracking-wide">
            <MapPin className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm uppercase tracking-widest">{location.name}</h2>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Current Weather
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/40 p-2.5 sm:p-2 rounded-2xl border border-slate-900/60 backdrop-blur-md w-full sm:w-auto">
          <button
            onClick={() => setIsFahrenheit(!isFahrenheit)}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-sm font-semibold text-zinc-100 hover:text-white transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/10 cursor-pointer text-center"
          >
            {isFahrenheit ? 'Switch to °C' : 'Switch to °F'}
          </button>
          <div className="relative group w-full sm:w-auto">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full sm:w-auto pl-11 pr-5 py-2.5 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 rounded-xl text-sm font-semibold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 appearance-none cursor-pointer hover:shadow-md hover:shadow-indigo-500/5"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      </header>

      {geoError && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl text-yellow-500 text-sm">
          Warning: {geoError}
        </div>
      )}

      {weatherError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between gap-4">
          <span>Error loading weather: {weatherError}</span>
          <button 
            onClick={refetch}
            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer hover:shadow-md active:scale-95 shrink-0"
          >
            Retry
          </button>
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
