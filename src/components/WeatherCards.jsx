import React from 'react';
import { Thermometer, Droplets, Sun, Wind, Activity } from 'lucide-react';
import dayjs from 'dayjs';

const colorMap = {
  'red-500': {
    glow: 'from-red-500/10 to-transparent',
    icon: 'text-red-400',
    border: 'hover:border-red-500/30',
  },
  'blue-500': {
    glow: 'from-blue-500/10 to-transparent',
    icon: 'text-blue-400',
    border: 'hover:border-blue-500/30',
  },
  'orange-400': {
    glow: 'from-orange-500/10 to-transparent',
    icon: 'text-orange-400',
    border: 'hover:border-orange-500/30',
  },
  'cyan-500': {
    glow: 'from-cyan-500/10 to-transparent',
    icon: 'text-cyan-400',
    border: 'hover:border-cyan-500/30',
  },
  'emerald-500': {
    glow: 'from-emerald-500/10 to-transparent',
    icon: 'text-emerald-400',
    border: 'hover:border-emerald-500/30',
  }
};

const Card = ({ title, icon: Icon, children, glowColor }) => {
  const colors = colorMap[glowColor] || colorMap['blue-500'];
  return (
    <div className={`realistic-card p-5 sm:p-6 group relative border border-slate-900/40 ${colors.border}`}>
      {/* Realistic inner light scatter effect */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-radial ${colors.glow} opacity-50 blur-2xl group-hover:opacity-80 transition-opacity duration-500 pointer-events-none`} />
      
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-900/50 relative z-10">
        <h3 className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase drop-shadow-sm group-hover:text-slate-200 transition-colors">{title}</h3>
        <div className="p-2 bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_2px_4px_rgba(0,0,0,0.5)] border border-slate-800 shrink-0 ml-2">
          <Icon className={`w-4 h-4 ${colors.icon} drop-shadow-[0_0_8px_currentColor]`} />
        </div>
      </div>
      <div className="space-y-4 relative z-10">{children}</div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between items-start group py-1 gap-2 min-w-0">
    <span className="text-slate-400 text-xs sm:text-sm font-medium transition-colors group-hover:text-slate-300 min-w-0 break-words">{label}</span>
    <span className="text-slate-100 text-xs sm:text-sm font-semibold tracking-wide drop-shadow-md text-right min-w-0 break-words">{value}</span>
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

  const getUVBadge = (uv) => {
    if (uv === undefined || uv === null) return '--';
    let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    let label = 'Low';
    if (uv >= 3 && uv <= 5) { color = 'text-amber-400 bg-amber-500/10 border-amber-500/20'; label = 'Mod'; }
    else if (uv >= 6 && uv <= 7) { color = 'text-orange-400 bg-orange-500/10 border-orange-500/20'; label = 'High'; }
    else if (uv >= 8) { color = 'text-rose-400 bg-rose-500/10 border-rose-500/20'; label = 'Risk'; }
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-md whitespace-nowrap ${color}`}>
        {uv} ({label})
      </span>
    );
  };

  const getAQIBadge = (aqi) => {
    if (aqi === undefined || aqi === null) return '--';
    let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    let text = 'Good';
    if (aqi > 50 && aqi <= 100) { color = 'text-amber-400 bg-amber-500/10 border-amber-500/20'; text = 'Fair'; }
    else if (aqi > 100) { color = 'text-rose-400 bg-rose-500/10 border-rose-500/20'; text = 'Poor'; }
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-md whitespace-nowrap ${color}`}>
        {aqi} {text}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
      <Card title="Temperature" icon={Thermometer} glowColor="red-500">
        <Row label="Current" value={<span className="text-red-400 text-sm sm:text-base font-bold">{getT(cur.temperature_2m)}</span>} />
        <Row label="Maximum" value={<span className="text-amber-400">↑ {getT(d.temperature_2m_max?.[0])}</span>} />
        <Row label="Minimum" value={<span className="text-cyan-400">↓ {getT(d.temperature_2m_min?.[0])}</span>} />
      </Card>

      <Card title="Atmosphere" icon={Droplets} glowColor="blue-500">
        <div className="space-y-1">
          <Row label="Humidity" value={`${cur.relative_humidity_2m ?? '--'}%`} />
          <div className="w-full bg-slate-950/60 h-1 rounded-full overflow-hidden border border-slate-900/50">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${cur.relative_humidity_2m ?? 0}%` }} />
          </div>
        </div>
        <Row label="Precipitation" value={`${cur.precipitation ?? '--'} mm`} />
        <Row label="UV Index" value={getUVBadge(d.uv_index_max?.[0])} />
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
        <Row label="AQI" value={getAQIBadge(aq.european_aqi)} />
        <Row label="PM10 | PM2.5" value={`${aq.pm10 ?? '--'} | ${aq.pm2_5 ?? '--'} μg/m³`} />
        <Row label="CO | CO₂" value={`${aq.carbon_monoxide ?? '--'} | ${aq.carbon_dioxide ?? '--'} μg/m³`} />
        <Row label="NO₂ | SO₂" value={`${aq.nitrogen_dioxide ?? '--'} | ${aq.sulphur_dioxide ?? '--'} μg/m³`} />
      </Card>
    </div>
  );
}
