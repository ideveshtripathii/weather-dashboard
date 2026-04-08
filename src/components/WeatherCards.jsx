import React from 'react';
import { Thermometer, Droplets, Sun, Wind, Activity } from 'lucide-react';
import dayjs from 'dayjs';

const Card = ({ title, icon: Icon, children, glowColor }) => (
  <div className="realistic-card p-6 sm:p-7 group">
    {/* Realistic inner light scatter effect */}
    <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-radial from-${glowColor}/20 to-transparent opacity-50 blur-2xl group-hover:opacity-80 transition-opacity duration-500`} />
    
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-700/50 relative z-10">
      <h3 className="text-sm font-bold text-zinc-400 tracking-wider uppercase drop-shadow-sm">{title}</h3>
      <div className={`p-2 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_4px_rgba(0,0,0,0.5)] border border-zinc-700/80`}>
        <Icon className={`w-4 h-4 text-${glowColor.replace('-500', '-300').replace('orange-400', 'orange-300')} drop-shadow-[0_0_8px_currentColor]`} />
      </div>
    </div>
    <div className="space-y-4 relative z-10">{children}</div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center group py-0.5">
    <span className="text-zinc-500 text-sm font-medium transition-colors group-hover:text-zinc-400">{label}</span>
    <span className="text-zinc-100 font-semibold tracking-wide drop-shadow-md">{value}</span>
  </div>
);

export function WeatherCards({ weatherData, airData, isFahrenheit }) {
  if (!weatherData || !weatherData.current) return null;

  const cur = weatherData.current;
  const d = weatherData.daily || {};
  const aq = airData?.current || {};

  const getT = (val) => {
    if (val === undefined || val === null) return '--';
    return isFahrenheit ? `${((val * 9) / 5 + 32).toFixed(1)}°F` : `${val.toFixed(1)}°C`;
  };

  const getTDate = (timeStr) => {
    if (!timeStr) return '--:--';
    return dayjs(timeStr).format('hh:mm A');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      <Card title="Temperature" icon={Thermometer} glowColor="red-500">
        <Row label="Current" value={getT(cur.temperature_2m)} />
        <Row label="Maximum" value={getT(d.temperature_2m_max?.[0])} />
        <Row label="Minimum" value={getT(d.temperature_2m_min?.[0])} />
      </Card>

      <Card title="Atmosphere" icon={Droplets} glowColor="blue-500">
        <Row label="Relative Humidity" value={`${cur.relative_humidity_2m ?? '--'}%`} />
        <Row label="Precipitation" value={`${cur.precipitation ?? '--'} mm`} />
        <Row label="UV Index" value={d.uv_index_max?.[0] ?? '--'} />
      </Card>

      <Card title="Sun Cycle" icon={Sun} glowColor="orange-400">
        <Row label="Sunrise" value={getTDate(d.sunrise?.[0])} />
        <Row label="Sunset" value={getTDate(d.sunset?.[0])} />
      </Card>

      <Card title="Wind & Air" icon={Wind} glowColor="cyan-500">
        <Row label="Max Wind Speed" value={`${d.wind_speed_10m_max?.[0] ?? '--'} km/h`} />
        <Row label="Precip. Probability" value={`${d.precipitation_probability_max?.[0] ?? '--'}%`} />
      </Card>

      <Card title="Air Quality" icon={Activity} glowColor="emerald-500">
        <Row label="AQI" value={aq.european_aqi ?? '--'} />
        <Row label="PM10 | PM2.5" value={`${aq.pm10 ?? '--'} | ${aq.pm2_5 ?? '--'} μg/m³`} />
        <Row label="CO | CO₂" value={`${aq.carbon_monoxide ?? '--'} | ${aq.carbon_dioxide ?? '--'} μg/m³`} />
        <Row label="NO₂ | SO₂" value={`${aq.nitrogen_dioxide ?? '--'} | ${aq.sulphur_dioxide ?? '--'} μg/m³`} />
      </Card>
    </div>
  );
}
