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

  const { data, loading, error: histError } = useHistoricalWeather(
    location?.lat,
    location?.lon,
    startDate,
    endDate
  );

  if (!location) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
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
            Historical Trends
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-slate-900 border border-slate-800 p-2 lg:p-3 rounded-2xl shadow-sm">
          <CalendarRange className="w-5 h-5 text-slate-400 ml-2" />
          <input
            type="date"
            max={endDate}
            min={dayjs(endDate).subtract(2, 'year').format('YYYY-MM-DD')}
            value={startDate}
            onChange={handleStartChange}
            className="bg-transparent border-none text-sm font-medium focus:outline-none text-slate-200 ml-2"
            style={{ colorScheme: 'dark' }}
          />
          <span className="text-slate-500">-</span>
          <input
            type="date"
            max={maxDate}
            min={startDate}
            value={endDate}
            onChange={handleEndChange}
            className="bg-transparent border-none text-sm font-medium focus:outline-none text-slate-200"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </header>
      
      {geoError && <div className="mb-6 p-4 bg-yellow-500/10 text-yellow-500 text-sm">{geoError}</div>}
      {histError && <div className="mb-6 p-4 bg-red-500/10 text-red-500 text-sm">{histError}</div>}

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
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl text-sm z-50">
        <p className="text-slate-300 mb-2 font-medium">{label}</p>
        {payload.map((entry, index) => {
          let val = entry.value;
          if (entry.name === 'Sunrise' || entry.name === 'Sunrise (IST)') val = entry.payload.sunrise;
          if (entry.name === 'Sunset' || entry.name === 'Sunset (IST)') val = entry.payload.sunset;
          return (
            <p key={index} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {val}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const ChartBox = ({ title, children }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
    <h3 className="text-lg font-semibold text-slate-200 mb-6">{title}</h3>
    <div className="w-full h-[350px]">
      {children}
    </div>
  </div>
);

function HistoricalCharts({ weatherData, airData }) {
  if (!weatherData?.daily) return <p>No historical data available.</p>;

  const d = weatherData.daily;
  
  const wData = d.time.map((t, i) => {
    // Note: Assuming the application or user considers the display time in IST context.
    // If the timezone returned by API is local, we append a suffix or convert if it had UTC.
    // Since Open-Meteo returns '2023-01-01T06:30' without offset, we format it directly and label it IST.
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
          <LineChart data={wData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <RTCooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36}/>
            <Line type="monotone" dataKey="tMax" name="Max Temp" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="tMean" name="Mean Temp" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="tMin" name="Min Temp" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Brush dataKey="date" height={30} stroke="#3b82f6" fill="#1e293b" />
          </LineChart>
        </ResponsiveContainer>
      </ChartBox>
      
      <ChartBox title="Sun Cycle (IST)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={wData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis domain={[0, 24]} tickFormatter={val => `${Math.floor(val)}:00`} stroke="#94a3b8" />
            <RTCooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36}/>
            <Line type="monotone" dataKey="sunriseHour" name="Sunrise" stroke="#fcd34d" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="sunsetHour" name="Sunset" stroke="#f97316" strokeWidth={2} dot={false} />
            <Brush dataKey="date" height={30} stroke="#3b82f6" fill="#1e293b" />
          </LineChart>
        </ResponsiveContainer>
      </ChartBox>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartBox title="Precipitation Totals (mm)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <RTCooltip content={<CustomTooltip />} />
              <Bar dataKey="precip" name="Precipitation" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              <Brush dataKey="date" height={30} stroke="#3b82f6" fill="#1e293b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Max Wind Speed & Dominant Direction">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={wData}>
              <defs>
                <linearGradient id="windColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis yAxisId="left" stroke="#94a3b8" />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
              <RTCooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36}/>
              <Area yAxisId="left" type="monotone" dataKey="windMax" name="Max Wind Speed (km/h)" stroke="#10b981" fill="url(#windColor)" />
              <Line yAxisId="right" type="step" dataKey="windDir" name="Dominant Direction (°)" stroke="#cbd5e1" dot={false} strokeWidth={2} />
              <Brush dataKey="date" height={30} stroke="#3b82f6" fill="#1e293b" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>

      <ChartBox title="Air Quality PM10 & PM2.5 (μg/m³)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyAirData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <RTCooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36}/>
            <Line type="monotone" dataKey="pm10" name="PM10" stroke="#f43f5e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="pm2_5" name="PM2.5" stroke="#ec4899" strokeWidth={2} dot={false} />
            <Brush dataKey="date" height={30} stroke="#3b82f6" fill="#1e293b" />
          </LineChart>
        </ResponsiveContainer>
      </ChartBox>

    </div>
  );
}
