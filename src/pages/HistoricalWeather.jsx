import React, { useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useHistoricalWeather } from '../hooks/useWeather';
import dayjs from 'dayjs';
import { Loader2, CalendarRange, MapPin } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTCooltip, ResponsiveContainer, Brush, Legend, AreaChart, Area, ComposedChart
} from 'recharts';

export default function HistoricalWeather() {
  const { location, error: geoError } = useGeolocation();
  
  const maxDate = dayjs().subtract(2, 'day').format('YYYY-MM-DD');
  const defaultEnd = maxDate;
  const defaultStart = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
  
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  
  // enforce max 2 years
  const handleStartChange = (e) => {
    const val = e.target.value;
    const end = dayjs(endDate);
    if (dayjs(val).isBefore(end.subtract(2, 'year'))) {
      alert("Maximum date range is 2 years");
      setStartDate(end.subtract(2, 'year').format('YYYY-MM-DD'));
    } else {
      setStartDate(val);
    }
  };
  
  const handleEndChange = (e) => {
    const val = e.target.value;
    const start = dayjs(startDate);
    if (dayjs(val).isAfter(start.add(2, 'year'))) {
      alert("Maximum date range is 2 years");
      setEndDate(start.add(2, 'year').format('YYYY-MM-DD'));
    } else {
      setEndDate(val);
    }
  };

  const { data, loading, error: histError, refetch } = useHistoricalWeather(
    location?.lat,
    location?.lon,
    startDate,
    endDate
  );

  if (!location) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-700 zoom-in-[0.98]">
      {geoError && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl text-yellow-500 text-sm">
          Warning: {geoError}
        </div>
      )}

      {histError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between gap-4">
          <span>Error loading historical weather: {histError}</span>
          <button 
            onClick={refetch}
            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer hover:shadow-md active:scale-95 shrink-0"
          >
            Retry
          </button>
        </div>
      )}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12 realistic-card p-6 sm:p-8">
        <div>
          <div className="flex items-center space-x-2 text-slate-400 mb-2 font-medium tracking-wide">
            <MapPin className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm uppercase tracking-widest">{location.name}</h2>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Historical Trends
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/40 p-2.5 sm:p-2 rounded-2xl border border-slate-900/60 backdrop-blur-md w-full sm:w-auto">
          <div className="relative flex items-center w-full sm:w-auto">
            <CalendarRange className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none hidden sm:block" />
            <input
              type="date"
              max={endDate}
              min={dayjs(endDate).subtract(2, 'year').format('YYYY-MM-DD')}
              value={startDate}
              onChange={handleStartChange}
              className="w-full sm:w-auto pl-4 sm:pl-11 pr-4 py-2.5 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 rounded-xl text-sm font-semibold focus:outline-none text-zinc-100 hover:text-white cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/5"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <span className="text-slate-600 text-center hidden sm:block select-none">-</span>
          <input
            type="date"
            max={maxDate}
            min={startDate}
            value={endDate}
            onChange={handleEndChange}
            className="w-full sm:w-auto pl-4 pr-4 py-2.5 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 rounded-xl text-sm font-semibold focus:outline-none text-zinc-100 hover:text-white cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/5"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
      ) : data ? (
        <HistoricalCharts weatherData={data.weather} airData={data.airQuality} />
      ) : null}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-xs sm:text-sm z-50">
        <p className="text-slate-300 mb-2 font-bold border-b border-slate-900/60 pb-2 tracking-wide">{label}</p>
        {payload.map((entry, index) => {
          let val = entry.value;
          if (entry.name === 'Sunrise' || entry.name === 'Sunrise (IST)') val = entry.payload.sunrise;
          if (entry.name === 'Sunset' || entry.name === 'Sunset (IST)') val = entry.payload.sunset;
          return (
            <p key={index} style={{ color: entry.color }} className="font-semibold mt-1">
              {entry.name}: <span className="text-white">{val}</span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const ChartBox = ({ title, children }) => (
  <div className="realistic-card p-4 sm:p-6 mb-6">
    <h3 className="text-base sm:text-lg font-bold text-zinc-300 mb-4 sm:mb-6 tracking-wide drop-shadow-sm">{title}</h3>
    <div className="w-full h-[260px] sm:h-[320px] md:h-[350px]">
      {children}
    </div>
  </div>
);

function HistoricalCharts({ weatherData, airData }) {
  if (!weatherData?.daily) return <p className="text-slate-400 p-6 text-center">No historical data available.</p>;

  const d = weatherData.daily;
  
  const wData = d.time.map((t, i) => {
    const sunriseStr = d.sunrise[i] ? dayjs(d.sunrise[i]).format('hh:mm A') + ' IST' : '--:--';
    const sunsetStr = d.sunset[i] ? dayjs(d.sunset[i]).format('hh:mm A') + ' IST' : '--:--';
    const sunriseHour = d.sunrise[i] ? parseFloat((dayjs(d.sunrise[i]).hour() + dayjs(d.sunrise[i]).minute() / 60).toFixed(2)) : null;
    const sunsetHour = d.sunset[i] ? parseFloat((dayjs(d.sunset[i]).hour() + dayjs(d.sunset[i]).minute() / 60).toFixed(2)) : null;

    return {
      date: t,
      tMax: d.temperature_2m_max[i],
      tMin: d.temperature_2m_min[i],
      tMean: d.temperature_2m_mean[i],
      sunrise: sunriseStr,
      sunset: sunsetStr,
      sunriseHour,
      sunsetHour,
      precip: d.precipitation_sum[i],
      windMax: d.wind_speed_10m_max[i],
      windDir: d.wind_direction_10m_dominant[i],
    };
  });

  const aqHourly = airData?.hourly || { time: [] };
  // Group AQI by day to match the daily charts
  const aqDaily = {};
  aqHourly.time.forEach((tStr, i) => {
    const dayDate = dayjs(tStr).format('YYYY-MM-DD');
    if (!aqDaily[dayDate]) {
      aqDaily[dayDate] = { pm10: [], pm2_5: [] };
    }
    if (aqHourly.pm10?.[i] != null) aqDaily[dayDate].pm10.push(aqHourly.pm10[i]);
    if (aqHourly.pm2_5?.[i] != null) aqDaily[dayDate].pm2_5.push(aqHourly.pm2_5[i]);
  });
  
  const dailyAirData = Object.keys(aqDaily).map(date => {
    const pm10Arr = aqDaily[date].pm10;
    const pm2_5Arr = aqDaily[date].pm2_5;
    return {
      date,
      pm10: pm10Arr.length ? parseFloat((pm10Arr.reduce((a, b) => a + b, 0) / pm10Arr.length).toFixed(1)) : 0,
      pm2_5: pm2_5Arr.length ? parseFloat((pm2_5Arr.reduce((a, b) => a + b, 0) / pm2_5Arr.length).toFixed(1)) : 0,
    }
  });

  return (
    <div className="space-y-6">
      <ChartBox title="Temperature Over Time (°C)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={wData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <filter id="glowMax" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.2} />
            <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 11}} />
            <YAxis stroke="#64748b" tick={{fontSize: 11}} />
            <RTCooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Line type="monotone" dataKey="tMax" name="Max Temp" stroke="#ef4444" strokeWidth={3} filter="url(#glowMax)" dot={false} />
            <Line type="monotone" dataKey="tMean" name="Mean Temp" stroke="#f59e0b" strokeWidth={2.5} filter="url(#glowMax)" dot={false} />
            <Line type="monotone" dataKey="tMin" name="Min Temp" stroke="#3b82f6" strokeWidth={2.5} filter="url(#glowMax)" dot={false} />
            <Brush dataKey="date" height={28} stroke="#6366f1" fill="#090d16" />
          </LineChart>
        </ResponsiveContainer>
      </ChartBox>
      
      <ChartBox title="Sun Cycle (IST)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={wData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <filter id="glowSun" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.2} />
            <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 11}} />
            <YAxis domain={[0, 24]} tickFormatter={val => `${Math.floor(val)}:00`} stroke="#64748b" tick={{fontSize: 11}} />
            <RTCooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Line type="monotone" dataKey="sunriseHour" name="Sunrise" stroke="#fcd34d" strokeWidth={3} filter="url(#glowSun)" dot={false} />
            <Line type="monotone" dataKey="sunsetHour" name="Sunset" stroke="#f97316" strokeWidth={3} filter="url(#glowSun)" dot={false} />
            <Brush dataKey="date" height={28} stroke="#6366f1" fill="#090d16" />
          </LineChart>
        </ResponsiveContainer>
      </ChartBox>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartBox title="Precipitation Totals (mm)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.2} />
              <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis stroke="#64748b" tick={{fontSize: 11}} />
              <RTCooltip content={<CustomTooltip />} />
              <Bar dataKey="precip" name="Precipitation" fill="#60a5fa" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
              <Brush dataKey="date" height={28} stroke="#6366f1" fill="#090d16" />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Max Wind Speed & Dominant Direction">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={wData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="windColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <filter id="glowWindMax" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.2} />
              <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize: 11}} />
              <RTCooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area yAxisId="left" type="monotone" dataKey="windMax" name="Max Wind Speed (km/h)" stroke="#10b981" strokeWidth={2.5} filter="url(#glowWindMax)" fill="url(#windColor)" />
              <Line yAxisId="right" type="step" dataKey="windDir" name="Dominant Direction (°)" stroke="#cbd5e1" dot={false} strokeWidth={2} />
              <Brush dataKey="date" height={28} stroke="#6366f1" fill="#090d16" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>

      <ChartBox title="Air Quality PM10 & PM2.5 (μg/m³)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyAirData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <filter id="glowAQ" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.2} />
            <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 11}} />
            <YAxis stroke="#64748b" tick={{fontSize: 11}} />
            <RTCooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Line type="monotone" dataKey="pm10" name="PM10" stroke="#f43f5e" strokeWidth={2.5} filter="url(#glowAQ)" dot={false} />
            <Line type="monotone" dataKey="pm2_5" name="PM2.5" stroke="#ec4899" strokeWidth={2.5} filter="url(#glowAQ)" dot={false} />
            <Brush dataKey="date" height={28} stroke="#6366f1" fill="#090d16" />
          </LineChart>
        </ResponsiveContainer>
      </ChartBox>
    </div>
  );
}
