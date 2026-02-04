import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Users, BarChart3, Inbox, Settings, Menu, X, Search, Bell, Plus, DollarSign, ChevronDown, Zap, Calendar } from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    sales: false,
    activities: false,
    integrations: false
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const toggleDropdown = (key) => {
    setDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFCF8] text-gray-800 antialiased selection:bg-orange-100 selection:text-orange-600">
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/50 z-30 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <aside className={`fixed lg:relative w-64 h-full flex flex-col border-r border-gray-100 bg-white z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FF7F40] shadow-lg shadow-orange-500/20"></div>
            <span className="text-base sm:text-lg font-medium tracking-tight text-gray-900">LeadFlow</span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-gray-600" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pt-4 sm:pt-6 px-2 sm:px-3 pb-4 sm:pb-6 space-y-1">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium transition-all ${
              isActive 
                ? 'bg-orange-50 text-gray-900 border border-orange-100' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard className="h-5 w-5 sm:h-4 sm:w-4 text-[#FF7F40]" />
            Overview
          </NavLink>

          <NavLink 
            to="/pipeline" 
            className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium transition-all ${
              isActive 
                ? 'bg-orange-50 text-gray-900 border border-orange-100' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-900" />
            Pipeline
          </NavLink>

          <NavLink 
            to="/contacts" 
            className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium transition-all ${
              isActive 
                ? 'bg-orange-50 text-gray-900 border border-orange-100' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Users className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-900" />
            Contacts
          </NavLink>

          <NavLink 
            to="/reports" 
            className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium transition-all ${
              isActive 
                ? 'bg-orange-50 text-gray-900 border border-orange-100' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-900" />
            Reports
          </NavLink>

          <NavLink 
            to="/inbox" 
            className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium transition-all ${
              isActive 
                ? 'bg-orange-50 text-gray-900 border border-orange-100' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Inbox className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-900" />
            Inbox
            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">4</span>
          </NavLink>

          {/* Dropdown Menus Section */}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
              {/* Sales Dropdown */}
              <div className="space-y-1">
                <button 
                  onClick={() => toggleDropdown('sales')}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg transition-all"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#FF7F40]" />
                    <span>Sales</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${dropdowns.sales ? 'rotate-180' : ''}`} />
                </button>
                {dropdowns.sales && (
                  <div className="pl-9 space-y-1">
                    <Link to="/pipeline" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Pipeline</Link>
                    <Link to="/forecasts" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Forecasts</Link>
                    <Link to="/analytics" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Analytics</Link>
                  </div>
                )}
              </div>

              {/* Activities Dropdown */}
              <div className="space-y-1">
                <button 
                  onClick={() => toggleDropdown('activities')}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#FF7F40]" />
                    <span>Activities</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${dropdowns.activities ? 'rotate-180' : ''}`} />
                </button>
                {dropdowns.activities && (
                  <div className="pl-9 space-y-1">
                    <Link to="/tasks" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Tasks</Link>
                    <Link to="/meetings" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Meetings</Link>
                    <Link to="/calls" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Calls</Link>
                  </div>
                )}
              </div>

              {/* Integrations Dropdown */}
              <div className="space-y-1">
                <button 
                  onClick={() => toggleDropdown('integrations')}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#FF7F40]" />
                    <span>Integrations</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${dropdowns.integrations ? 'rotate-180' : ''}`} />
                </button>
                {dropdowns.integrations && (
                  <div className="pl-9 space-y-1">
                    <Link to="/email" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Email</Link>
                    <Link to="/calendar" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Calendar</Link>
                    <Link to="/apps" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Apps</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-gray-100 p-3 sm:p-4">
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium transition-all ${
              isActive 
                ? 'bg-orange-50 text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-900" />
            Settings
          </NavLink>
          <div className="mt-3 sm:mt-4 flex items-center gap-3 px-3">
            <div className="relative h-8 w-8 rounded-full bg-gray-200">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" className="h-full w-full rounded-full object-cover ring-2 ring-white" />
              <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">Alex M.</p>
              <p className="text-xs text-gray-400">Head of Sales</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FFFCF8]">
        {/* Top Header */}
        <header className="flex h-14 sm:h-16 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-sm px-3 sm:px-4 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <button className="text-gray-500 hover:text-gray-700 p-1" onClick={toggleSidebar}>
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#FF7F40]"></div>
              <span className="text-base sm:text-lg font-medium tracking-tight text-gray-900">LeadFlow</span>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <nav className="flex text-sm font-medium text-gray-500">
              <span className="hover:text-gray-900 cursor-pointer">Dashboards</span>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-900">Sales Overview</span>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
            <button className="sm:hidden rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            <div className="relative hidden sm:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-600" />
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="h-9 w-40 md:w-56 lg:w-64 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none ring-orange-200 transition-all focus:bg-white focus:ring-2 focus:border-transparent placeholder:text-gray-400"
              />
            </div>
            
            <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF7F40] border border-white" />
            </button>
            
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#FF7F40] px-3 sm:px-4 py-2 text-sm font-medium text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Lead</span>
            </button>
          </div>
        </header>

        {/* Page Content - This is where child routes render */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}