import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import CurrentWeather from './pages/CurrentWeather';
import HistoricalWeather from './pages/HistoricalWeather';
import { CloudRain, History, MapPin } from 'lucide-react';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20 hidden md:flex shrink-0">
          <div className="p-6 flex items-center space-x-3">
            <div className="p-2 bg-brand-500 rounded-lg shadow-lg shadow-brand-500/30">
              <CloudRain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-100 to-white">
              WeatherScope
            </span>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-500 font-medium'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <CloudRain className="w-5 h-5" />
              <span>Current & Forecast</span>
            </NavLink>
            <NavLink
              to="/historical"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-500 font-medium'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <History className="w-5 h-5" />
              <span>Historical Data</span>
            </NavLink>
          </nav>

          <div className="p-6 text-xs text-slate-500 border-t border-slate-800/50">
            Data provided by Open-Meteo
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50 px-6 py-3 flex justify-around">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive ? 'text-brand-500' : 'text-slate-400'
              }`
            }
          >
            <CloudRain className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Forecast</span>
          </NavLink>
          <NavLink
            to="/historical"
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive ? 'text-brand-500' : 'text-slate-400'
              }`
            }
          >
            <History className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">History</span>
          </NavLink>
        </div>

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto overflow-x-hidden pb-20 md:pb-0 scroll-smooth">
          <Routes>
            <Route path="/" element={<CurrentWeather />} />
            <Route path="/historical" element={<HistoricalWeather />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
