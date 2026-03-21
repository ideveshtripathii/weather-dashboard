import React from 'react';
import { Thermometer, Droplets, Sun, Wind, Activity } from 'lucide-react';
import dayjs from 'dayjs';

const Card = ({ title, icon: Icon, children }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-2 bg-slate-800 rounded-lg">
        <Icon className="w-5 h-5 text-brand-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
    <span className="text-slate-400 text-sm">{label}</span>
    <span className="text-slate-100 font-medium">{value}</span>
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
      <Card title="Temperature" icon={Thermometer}>
        <Row label="Current" value={getT(cur.temperature_2m)} />
        <Row label="Maximum" value={getT(d.temperature_2m_max?.[0])} />
        <Row label="Minimum" value={getT(d.temperature_2m_min?.[0])} />
      </Card>

      <Card title="Atmosphere" icon={Droplets}>
        <Row label="Relative Humidity" value={`${cur.relative_humidity_2m ?? '--'}%`} />
        <Row label="Precipitation" value={`${cur.precipitation ?? '--'} mm`} />
        <Row label="UV Index" value={d.uv_index_max?.[0] ?? '--'} />
      </Card>

      <Card title="Sun Cycle" icon={Sun}>
        <Row label="Sunrise" value={getTDate(d.sunrise?.[0])} />
        <Row label="Sunset" value={getTDate(d.sunset?.[0])} />
      </Card>

      <Card title="Wind & Air" icon={Wind}>
        <Row label="Max Wind Speed" value={`${d.wind_speed_10m_max?.[0] ?? '--'} km/h`} />
        <Row label="Precip. Probability" value={`${d.precipitation_probability_max?.[0] ?? '--'}%`} />
      </Card>

      <Card title="Air Quality" icon={Activity}>
        <Row label="AQI" value={aq.european_aqi ?? '--'} />
        <Row label="PM10 | PM2.5" value={`${aq.pm10 ?? '--'} | ${aq.pm2_5 ?? '--'} μg/m³`} />
        <Row label="CO | CO₂" value={`${aq.carbon_monoxide ?? '--'} | ${aq.carbon_dioxide ?? '--'} μg/m³`} />
        <Row label="NO₂ | SO₂" value={`${aq.nitrogen_dioxide ?? '--'} | ${aq.sulphur_dioxide ?? '--'} μg/m³`} />
      </Card>
    </div>
  );
}
