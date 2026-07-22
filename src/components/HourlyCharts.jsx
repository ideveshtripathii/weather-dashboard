import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, Legend, AreaChart, Area, ComposedChart, Bar
} from 'recharts';
import dayjs from 'dayjs';

const ChartWrapper = ({ title, data, children }) => (
  <div className="realistic-card p-4 sm:p-6 mb-6">
    <h3 className="text-base sm:text-lg font-bold text-zinc-300 mb-4 sm:mb-6 tracking-wide drop-shadow-sm">{title}</h3>
    <div className="w-full h-[260px] sm:h-[320px] md:h-[350px]">
      {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-xs sm:text-sm z-50">
        <p className="text-slate-300 mb-2 font-bold border-b border-slate-900/60 pb-2 tracking-wide">{dayjs(label).format('hh:mm A')}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-semibold mt-1">
            {entry.name}: <span className="text-white">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function HourlyCharts({ weatherData, airData, isFahrenheit }) {
  if (!weatherData?.hourly) return null;

  const hourly = weatherData.hourly;
  const aqHourly = airData?.hourly || {};
  
  const chartData = hourly.time.map((t, i) => {
    let temp = hourly.temperature_2m[i];
    if (isFahrenheit && temp !== undefined) {
      temp = parseFloat(((temp * 9) / 5 + 32).toFixed(1));
    }
    return {
      time: t,
      temperature: temp,
      humidity: hourly.relative_humidity_2m[i],
      precipitation: hourly.precipitation[i],
      visibility: typeof hourly.visibility?.[i] === 'number' ? parseFloat((hourly.visibility[i] / 1000).toFixed(1)) : 0, // km
      windSpeed: hourly.wind_speed_10m[i],
      pm10: aqHourly.pm10?.[i] ?? 0,
      pm2_5: aqHourly.pm2_5?.[i] ?? 0,
    };
  });

  const timeFormatter = (t) => dayjs(t).format('HH:mm');

  return (
    <div className="space-y-6 mt-10">
      <h2 className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
        Hourly Forecast Visualizations
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title={`Temperature (${isFahrenheit ? '°F' : '°C'})`} data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <filter id="glowTemp" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.2} />
              <XAxis dataKey="time" tickFormatter={timeFormatter} stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis stroke="#64748b" tick={{fontSize: 11}} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="temperature" name="Temp" stroke="#ef4444" strokeWidth={3} filter="url(#glowTemp)" fillOpacity={1} fill="url(#colorTemp)" />
              <Brush dataKey="time" height={28} stroke="#6366f1" fill="#090d16" tickFormatter={timeFormatter} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Relative Humidity (%)" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <filter id="glowHum" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.2} />
              <XAxis dataKey="time" tickFormatter={timeFormatter} stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis stroke="#64748b" tick={{fontSize: 11}} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="humidity" name="Humidity" stroke="#3b82f6" strokeWidth={3} filter="url(#glowHum)" fill="url(#colorHum)" />
              <Brush dataKey="time" height={28} stroke="#6366f1" fill="#090d16" tickFormatter={timeFormatter}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Precipitation (mm)" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.2} />
              <XAxis dataKey="time" tickFormatter={timeFormatter} stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis stroke="#64748b" tick={{fontSize: 11}} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="precipitation" name="Precipitation" fill="#60a5fa" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
              <Brush dataKey="time" height={28} stroke="#6366f1" fill="#090d16" tickFormatter={timeFormatter}/>
            </ComposedChart>
          </ResponsiveContainer>
        </ChartWrapper>
        
        <ChartWrapper title="Visibility (km)" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <filter id="glowVis" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.2} />
              <XAxis dataKey="time" tickFormatter={timeFormatter} stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis stroke="#64748b" tick={{fontSize: 11}} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="visibility" name="Visibility" stroke="#f59e0b" strokeWidth={3} filter="url(#glowVis)" dot={false} />
              <Brush dataKey="time" height={28} stroke="#6366f1" fill="#090d16" tickFormatter={timeFormatter}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Wind Speed (km/h)" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <filter id="glowWind" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.2} />
              <XAxis dataKey="time" tickFormatter={timeFormatter} stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis stroke="#64748b" tick={{fontSize: 11}} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="windSpeed" name="Wind Speed" stroke="#10b981" strokeWidth={3} filter="url(#glowWind)" dot={false} />
              <Brush dataKey="time" height={28} stroke="#6366f1" fill="#090d16" tickFormatter={timeFormatter}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="PM10 & PM2.5 (μg/m³)" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <filter id="glowPm10" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glowPm25" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.2} />
              <XAxis dataKey="time" tickFormatter={timeFormatter} stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis stroke="#64748b" tick={{fontSize: 11}} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" dataKey="pm10" name="PM10" stroke="#f43f5e" strokeWidth={2.5} filter="url(#glowPm10)" dot={false} />
              <Line type="monotone" dataKey="pm2_5" name="PM2.5" stroke="#ec4899" strokeWidth={2.5} filter="url(#glowPm25)" dot={false} />
              <Brush dataKey="time" height={28} stroke="#6366f1" fill="#090d16" tickFormatter={timeFormatter}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>
    </div>
  );
}
