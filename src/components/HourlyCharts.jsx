import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, Legend, AreaChart, Area, ComposedChart, Bar
} from 'recharts';
import dayjs from 'dayjs';

const ChartWrapper = ({ title, data, children }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
    <h3 className="text-lg font-semibold text-slate-200 mb-6">{title}</h3>
    <div className="w-full h-[350px]">
      {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl text-sm z-50">
        <p className="text-slate-300 mb-2 font-medium">{dayjs(label).format('hh:mm A')}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {entry.value}
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
    <div className="space-y-6 mt-8">
      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-100 to-white">
        Hourly Forecast Visualizations
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartWrapper title={`Temperature (${isFahrenheit ? '°F' : '°C'})`} data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" tickFormatter={timeFormatter} stroke="#94a3b8" tick={{fontSize: 12}} />
              <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="temperature" name="Temp" stroke="#ef4444" fillOpacity={1} fill="url(#colorTemp)" />
              <Brush dataKey="time" height={30} stroke="#3b82f6" fill="#1e293b" tickFormatter={timeFormatter} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Relative Humidity (%)" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" tickFormatter={timeFormatter} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="humidity" name="Humidity" stroke="#3b82f6" fill="url(#colorHum)" />
              <Brush dataKey="time" height={30} stroke="#3b82f6" fill="#1e293b" tickFormatter={timeFormatter}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Precipitation (mm)" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" tickFormatter={timeFormatter} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="precipitation" name="Precipitation" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              <Brush dataKey="time" height={30} stroke="#3b82f6" fill="#1e293b" tickFormatter={timeFormatter}/>
            </ComposedChart>
          </ResponsiveContainer>
        </ChartWrapper>
        
        <ChartWrapper title="Visibility (km)" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" tickFormatter={timeFormatter} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="visibility" name="Visibility" stroke="#f59e0b" strokeWidth={3} dot={false} />
              <Brush dataKey="time" height={30} stroke="#3b82f6" fill="#1e293b" tickFormatter={timeFormatter}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Wind Speed (km/h)" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" tickFormatter={timeFormatter} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="windSpeed" name="Wind Speed" stroke="#10b981" strokeWidth={3} dot={false} />
              <Brush dataKey="time" height={30} stroke="#3b82f6" fill="#1e293b" tickFormatter={timeFormatter}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="PM10 & PM2.5 (μg/m³)" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" tickFormatter={timeFormatter} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="pm10" name="PM10" stroke="#f43f5e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="pm2_5" name="PM2.5" stroke="#ec4899" strokeWidth={2} dot={false} />
              <Brush dataKey="time" height={30} stroke="#3b82f6" fill="#1e293b" tickFormatter={timeFormatter}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>
    </div>
  );
}
