import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, Users, BarChart3, Inbox, Settings, Menu, X, Search, Bell, Plus, DollarSign, Target, PieChart, Briefcase, ChevronUp, TrendingDown, ChevronDown, Zap, Calendar, Mail } from 'lucide-react';

// Shared contacts data - in a real app, this would come from a context/state management
const SAMPLE_CONTACTS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    company: 'Acme Corp',
    email: 'sarah.j@acmecorp.com',
    phone: '+1 (555) 123-4567',
    status: 'hot',
    value: 45000,
    stage: 'Negotiation',
    avatar: 'AC',
    probability: 80,
    lastContact: '2 hours ago'
  },
  {
    id: 2,
    name: 'Michael Chen',
    company: 'Stark Tech',
    email: 'm.chen@starktech.io',
    phone: '+1 (555) 234-5678',
    status: 'warm',
    value: 22500,
    stage: 'Proposal',
    avatar: 'ST',
    probability: 60,
    lastContact: '1 day ago'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    company: 'Wayne Ltd',
    email: 'e.rodriguez@wayneltd.com',
    phone: '+1 (555) 345-6789',
    status: 'cold',
    value: 12000,
    stage: 'Qualified',
    avatar: 'WL',
    probability: 40,
    lastContact: '3 days ago'
  },
  {
    id: 4,
    name: 'David Park',
    company: 'Oscorp Industries',
    email: 'd.park@oscorp.com',
    phone: '+1 (555) 456-7890',
    status: 'hot',
    value: 67000,
    stage: 'Negotiation',
    avatar: 'OI',
    probability: 85,
    lastContact: '5 hours ago'
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    company: 'Quinn Corp',
    email: 'l.anderson@quinncorp.com',
    phone: '+1 (555) 567-8901',
    status: 'warm',
    value: 18500,
    stage: 'Discovery',
    avatar: 'QC',
    probability: 35,
    lastContact: '2 days ago'
  }
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    sales: false,
    activities: false,
    integrations: false
  });

  // Calculate dynamic stats from contacts
  const calculateStats = () => {
    const totalRevenue = SAMPLE_CONTACTS.reduce((sum, contact) => sum + contact.value, 0);
    const activeLeads = SAMPLE_CONTACTS.filter(c => c.status === 'hot' || c.status === 'warm').length;
    const avgDealSize = totalRevenue / SAMPLE_CONTACTS.length;

    return {
      totalRevenue: `$${(totalRevenue / 1000).toFixed(1)}k`,
      activeLeads: activeLeads.toString(),
      winRate: '38.2%',
      avgDealSize: `$${(avgDealSize / 1000).toFixed(1)}k`
    };
  };

  const [stats] = useState(calculateStats());

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const toggleDropdown = (key) => {
    setDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Get top opportunities (high value deals)
  const topOpportunities = SAMPLE_CONTACTS
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(contact => ({
      company: contact.company,
      desc: `${contact.stage} Deal`,
      stage: contact.stage,
      value: `$${contact.value.toLocaleString()}`,
      probability: contact.probability,
      avatar: contact.avatar,
      color: 'orange',
      stageColor: contact.probability >= 70 ? 'emerald' : 'orange'
    }));

  // Calculate pipeline stages
  const pipelineStages = [
    { 
      name: 'Discovery', 
      leads: SAMPLE_CONTACTS.filter(c => c.stage === 'Discovery').length,
      percentage: 30,
      color: 'gray'
    },
    { 
      name: 'Proposal', 
      leads: SAMPLE_CONTACTS.filter(c => c.stage === 'Proposal').length,
      percentage: 45,
      color: 'orange'
    },
    { 
      name: 'Negotiation', 
      leads: SAMPLE_CONTACTS.filter(c => c.stage === 'Negotiation').length,
      percentage: 70,
      color: 'orange'
    },
  ];

  const statsData = [
    { label: 'Total Revenue', value: stats.totalRevenue, change: '+12%', isPositive: true, icon: DollarSign },
    { label: 'Active Leads', value: stats.activeLeads, change: '+4', isPositive: true, icon: Target },
    { label: 'Win Rate', value: stats.winRate, change: '-1.2%', isPositive: false, icon: PieChart },
    { label: 'Avg Deal Size', value: stats.avgDealSize, subtext: 'per deal', icon: Briefcase },
  ];

  const conversionData = [40, 55, 70, 85, 65, 75, 90];

  // Recent activity based on contacts
  const recentActivity = SAMPLE_CONTACTS
    .slice(0, 3)
    .map(contact => ({
      action: contact.stage === 'Negotiation' ? 'Deal in final stage' : contact.stage === 'Proposal' ? 'Proposal sent' : 'Follow-up scheduled',
      company: contact.company,
      time: contact.lastContact,
      color: contact.stage === 'Negotiation' ? 'emerald' : 'orange'
    }));

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
          <a href="#" className="group flex items-center gap-3 rounded-lg bg-orange-50 px-3 py-2.5 sm:py-2 text-sm font-medium text-gray-900 border border-orange-100">
            <LayoutDashboard className="h-5 w-5 sm:h-4 sm:w-4 text-[#FF7F40]" />
            Overview
          </a>
          <a href="#" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <TrendingUp className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-900" />
            Pipeline
          </a>
          <a href="#" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <Users className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-900" />
            Contacts
          </a>
          <a href="#" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <BarChart3 className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-900" />
            Reports
          </a>
          <a href="#" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <Inbox className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-900" />
            Inbox
            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">4</span>
          </a>

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
                    <a href="#" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Pipeline</a>
                    <a href="#" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Forecasts</a>
                    <a href="#" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Analytics</a>
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
                    <a href="#" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Tasks</a>
                    <a href="#" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Meetings</a>
                    <a href="#" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Calls</a>
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
                    <a href="#" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Email</a>
                    <a href="#" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Calendar</a>
                    <a href="#" className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-md hover:bg-white">Apps</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-gray-100 p-3 sm:p-4">
          <a href="#" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-all">
            <Settings className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-900" />
            Settings
          </a>
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
            
            <button 
              onClick={() => setIsLeadFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF7F40] px-3 sm:px-4 py-2 text-sm font-medium text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Lead</span>
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {statsData.map((stat, idx) => (
              <div key={idx} className="transition-transform hover:-translate-y-0.5 bg-white border-gray-100 border rounded-xl p-4 sm:p-5 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#FF7F40]" />
                </div>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mt-2 sm:mt-3 sm:items-baseline">
                  <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">{stat.value}</span>
                  {stat.change && (
                    <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-medium rounded py-0.5 px-1.5 w-fit ${stat.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                      {stat.isPositive ? <ChevronUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.change}
                    </span>
                  )}
                  {stat.subtext && (
                    <span className="text-[10px] sm:text-xs font-medium text-gray-500">{stat.subtext}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid Layout */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-3">
            {/* Left Column: Deals Table */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              <div className="rounded-xl border border-gray-100 bg-white shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)] overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-4 gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">High Priority Opportunities</h3>
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">Top value deals in your pipeline</p>
                  </div>
                  <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 w-fit">View all</button>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {topOpportunities.map((opp, idx) => (
                    <div key={idx} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-[#FF7F40] font-semibold text-xs border border-orange-100">{opp.avatar}</div>
                          <div>
                            <p className="font-medium text-gray-900">{opp.company}</p>
                            <p className="text-xs text-gray-500">{opp.desc}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-[#FF7F40] ring-1 ring-inset ring-orange-100">{opp.stage}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{opp.value}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 rounded-full bg-gray-100">
                            <div className={`h-1.5 rounded-full ${opp.probability >= 70 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{width: `${opp.probability}%`}} />
                          </div>
                          <span className="text-xs text-gray-500">{opp.probability}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-100 text-xs uppercase font-medium text-gray-400">
                        <th className="px-4 md:px-6 py-3">Lead / Company</th>
                        <th className="px-4 md:px-6 py-3">Stage</th>
                        <th className="px-4 md:px-6 py-3">Value</th>
                        <th className="px-4 md:px-6 py-3 hidden md:table-cell">Probability</th>
                        <th className="px-4 md:px-6 py-3 text-right">Owner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {topOpportunities.map((opp, idx) => (
                        <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-[#FF7F40] font-semibold text-xs border border-orange-100">{opp.avatar}</div>
                              <div>
                                <p className="font-medium text-gray-900">{opp.company}</p>
                                <p className="text-xs text-gray-500">{opp.desc}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-[#FF7F40] ring-1 ring-inset ring-orange-100">{opp.stage}</span>
                          </td>
                          <td className="px-4 md:px-6 py-4 font-medium text-gray-900">{opp.value}</td>
                          <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-gray-100">
                                <div className={`h-1.5 rounded-full ${opp.probability >= 70 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{width: `${opp.probability}%`}} />
                              </div>
                              <span className="text-xs text-gray-500">{opp.probability}%</span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 text-right">
                            <div className="flex justify-end">
                              <img className="h-6 w-6 rounded-full ring-2 ring-white" src={`https://i.pravatar.cc/150?u=${idx}`} alt="" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pipeline Health Chart */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Conversion Trend</h3>
                  <div className="flex h-24 sm:h-32 items-end gap-1.5 sm:gap-2">
                    {conversionData.map((height, idx) => (
                      <div 
                        key={idx}
                        className="flex-1 bg-gray-100 rounded-t-sm hover:bg-orange-100 transition-colors relative group"
                        style={{height: `${height}%`}}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Activity Feed */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)] h-fit">
              <div className="border-b border-gray-100 px-4 sm:px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className={`h-8 w-8 rounded-full ${activity.color === 'emerald' ? 'bg-emerald-100' : 'bg-orange-100'} flex items-center justify-center`}>
                      <div className={`h-2 w-2 rounded-full ${activity.color === 'emerald' ? 'bg-emerald-500' : 'bg-[#FF7F40]'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.company} · {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Pipeline by Stage</h3>
                  <div className="space-y-4">
                    {pipelineStages.map((stage, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500 font-medium group-hover:text-gray-900">{stage.name}</span>
                          <span className="text-gray-900 font-medium">{stage.leads} leads</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${stage.color === 'gray' ? 'bg-gray-400' : 'bg-[#FF7F40]'} rounded-full`} style={{width: `${stage.percentage}%`}} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,