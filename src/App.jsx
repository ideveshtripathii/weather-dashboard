import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import CurrentWeather from './pages/CurrentWeather';
import HistoricalWeather from './pages/HistoricalWeather';
import { CloudRain, History, MapPin } from 'lucide-react';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-[#030712] text-slate-100 overflow-hidden font-sans relative">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-float-slow z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/8 blur-[120px] pointer-events-none animate-float-slower z-0" />

        {/* Sidebar */}
        <aside className="w-64 bg-slate-950/40 backdrop-blur-xl border-r border-slate-900/60 flex flex-col z-20 hidden lg:flex shrink-0">
          <div className="p-6 flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
              <CloudRain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              WeatherScope
            </span>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 border border-transparent ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-semibold shadow-inner'
                    : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                }`
              }
            >
              <CloudRain className="w-5 h-5" />
              <span>Current & Forecast</span>
            </NavLink>
            <NavLink
              to="/historical"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 border border-transparent ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-semibold shadow-inner'
                    : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                }`
              }
            >
              <History className="w-5 h-5" />
              <span>Historical Data</span>
            </NavLink>
          </nav>

          <div className="p-6 text-xs text-slate-500 border-t border-slate-900/50">
            Data provided by Open-Meteo
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900/50 z-50 px-6 py-3 flex justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
                isActive ? 'text-indigo-400 scale-105 font-medium' : 'text-slate-400 hover:text-slate-300'
              }`
            }
          >
            <CloudRain className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Forecast</span>
          </NavLink>
          <NavLink
            to="/historical"
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
                isActive ? 'text-indigo-400 scale-105 font-medium' : 'text-slate-400 hover:text-slate-300'
              }`
            }
          >
            <History className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">History</span>
          </NavLink>
        </div>

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto overflow-x-hidden pb-20 lg:pb-0 scroll-smooth z-10">
          <Routes>
            <Route path="/" element={<CurrentWeather />} />
            <Route path="/historical" element={<HistoricalWeather />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
