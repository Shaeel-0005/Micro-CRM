import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, Users, BarChart3, Inbox, Settings, Menu, X, Search, Bell, Plus, DollarSign, Target, PieChart, Briefcase, ChevronUp, TrendingDown } from 'lucide-react';
import LeadForm from '../components/index';
import 

export default function C_Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: '$124,500',
    activeLeads: '42',
    winRate: '38.2%',
    avgDealSize: '$8,400'
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await leadAPI.getAll();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await leadAPI.getStats();
      setStats({
        totalRevenue: '$124,500', // This will come from backend later
        activeLeads: data.total.toString(),
        winRate: '38.2%', // Calculate from data
        avgDealSize: '$8,400'
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateLead = async (formData) => {
    try {
      const newLead = await leadAPI.create(formData);
      console.log('Lead created:', newLead);
      // Refresh leads list
      await fetchLeads();
      await fetchStats();
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  };

  const statsData = [
    { label: 'Total Revenue', value: stats.totalRevenue, change: '+12%', isPositive: true, icon: DollarSign },
    { label: 'Active Leads', value: stats.activeLeads, change: '+4', isPositive: true, icon: Target },
    { label: 'Win Rate', value: stats.winRate, change: '-1.2%', isPositive: false, icon: PieChart },
    { label: 'Avg Deal Size', value: stats.avgDealSize, subtext: 'per deal', icon: Briefcase },
  ];

  const opportunities = [
    { company: 'Acme Corp', desc: 'Enterprise License', stage: 'Negotiation', value: '$45,000', probability: 80, avatar: 'AC', color: 'indigo', stageColor: 'blue' },
    { company: 'Stark Tech', desc: 'Q3 Expansion', stage: 'Proposal', value: '$22,500', probability: 60, avatar: 'ST', color: 'orange', stageColor: 'purple' },
    { company: 'Wayne Ltd', desc: 'Consulting', stage: 'Qualified', value: '$12,000', probability: 40, avatar: 'WL', color: 'pink', stageColor: 'yellow' },
  ];

  const pipelineStages = [
    { name: 'Discovery', leads: 12, percentage: 30, color: 'slate' },
    { name: 'Proposal', leads: 8, percentage: 45, color: 'indigo' },
    { name: 'Negotiation', leads: 5, percentage: 15, color: 'purple' },
  ];

  const conversionData = [40, 55, 70, 85, 65, 75, 90];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-600 antialiased selection:bg-indigo-100 selection:text-indigo-700">
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-30 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <aside className={`fixed lg:relative w-64 h-full flex flex-col border-r border-slate-200 bg-white z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900">
            <span className="text-base sm:text-lg font-semibold tracking-tighter">NEXUS</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-slate-600" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pt-4 sm:pt-6 px-2 sm:px-3 pb-4 sm:pb-6 space-y-1">
          <a href="#" className="group flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5 sm:py-2 text-sm font-medium text-slate-900 ring-1 ring-slate-200/50">
            <LayoutDashboard className="h-5 w-5 sm:h-4 sm:w-4 text-slate-500" />
            Overview
          </a>
          <a href="#" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <TrendingUp className="h-5 w-5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-slate-900" />
            Pipeline
          </a>
          <a href="#" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <Users className="h-5 w-5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-slate-900" />
            Contacts
          </a>
          <a href="#" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <BarChart3 className="h-5 w-5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-slate-900" />
            Reports
          </a>
          <a href="#" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <Inbox className="h-5 w-5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-slate-900" />
            Inbox
            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">4</span>
          </a>
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-slate-100 p-3 sm:p-4">
          <a href="#" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-all">
            <Settings className="h-5 w-5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-slate-900" />
            Settings
          </a>
          <div className="mt-3 sm:mt-4 flex items-center gap-3 px-3">
            <div className="relative h-8 w-8 rounded-full bg-slate-200">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" className="h-full w-full rounded-full object-cover ring-2 ring-white" />
              <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-900">Alex M.</p>
              <p className="text-xs text-slate-400">Head of Sales</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        {/* Top Header */}
        <header className="flex h-14 sm:h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm px-3 sm:px-4 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <button className="text-slate-500 hover:text-slate-700 p-1" onClick={toggleSidebar}>
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <span className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">NEXUS</span>
          </div>
          
          <div className="hidden lg:block">
            <nav className="flex text-sm font-medium text-slate-500">
              <span className="hover:text-slate-900 cursor-pointer">Dashboards</span>
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-900">Sales Overview</span>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
            <button className="sm:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            <div className="relative hidden sm:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-600" />
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="h-9 w-40 md:w-56 lg:w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:border-transparent placeholder:text-slate-400"
              />
            </div>
            
            <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 border border-white" />
            </button>
            
            <button 
              onClick={() => setIsLeadFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 sm:px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-all active:scale-95"
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
              <div key={idx} className="transition-transform hover:-translate-y-0.5 bg-white border-slate-200 border rounded-xl p-4 sm:p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                </div>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mt-2 sm:mt-3 sm:items-baseline">
                  <span className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">{stat.value}</span>
                  {stat.change && (
                    <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-medium rounded py-0.5 px-1.5 w-fit ${stat.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                      {stat.isPositive ? <ChevronUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.change}
                    </span>
                  )}
                  {stat.subtext && (
                    <span className="text-[10px] sm:text-xs font-medium text-slate-500">{stat.subtext}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid Layout */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-3">
            {/* Left Column: Deals Table */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-4 gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">High Priority Opportunities</h3>
                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">Deals requiring attention within 7 days</p>
                  </div>
                  <button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 w-fit">View all</button>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden divide-y divide-slate-100">
                  {opportunities.map((opp, idx) => (
                    <div key={idx} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-${opp.color}-50 text-${opp.color}-600 font-semibold text-xs border border-${opp.color}-100`}>{opp.avatar}</div>
                          <div>
                            <p className="font-medium text-slate-900">{opp.company}</p>
                            <p className="text-xs text-slate-500">{opp.desc}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center rounded-md bg-${opp.stageColor}-50 px-2 py-1 text-xs font-medium text-${opp.stageColor}-700 ring-1 ring-inset ring-${opp.stageColor}-700/10`}>{opp.stage}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{opp.value}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 rounded-full bg-slate-100">
                            <div className={`h-1.5 rounded-full ${opp.probability >= 70 ? 'bg-emerald-500' : 'bg-yellow-400'}`} style={{width: `${opp.probability}%`}} />
                          </div>
                          <span className="text-xs text-slate-500">{opp.probability}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50">
                      <tr className="border-b border-slate-100 text-xs uppercase font-medium text-slate-400">
                        <th className="px-4 md:px-6 py-3">Lead / Company</th>
                        <th className="px-4 md:px-6 py-3">Stage</th>
                        <th className="px-4 md:px-6 py-3">Value</th>
                        <th className="px-4 md:px-6 py-3 hidden md:table-cell">Probability</th>
                        <th className="px-4 md:px-6 py-3 text-right">Owner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {opportunities.map((opp, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-${opp.color}-50 text-${opp.color}-600 font-semibold text-xs border border-${opp.color}-100`}>{opp.avatar}</div>
                              <div>
                                <p className="font-medium text-slate-900">{opp.company}</p>
                                <p className="text-xs text-slate-500">{opp.desc}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <span className={`inline-flex items-center rounded-md bg-${opp.stageColor}-50 px-2 py-1 text-xs font-medium text-${opp.stageColor}-700 ring-1 ring-inset ring-${opp.stageColor}-700/10`}>{opp.stage}</span>
                          </td>
                          <td className="px-4 md:px-6 py-4 font-medium text-slate-900">{opp.value}</td>
                          <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-slate-100">
                                <div className={`h-1.5 rounded-full ${opp.probability >= 70 ? 'bg-emerald-500' : 'bg-yellow-400'}`} style={{width: `${opp.probability}%`}} />
                              </div>
                              <span className="text-xs text-slate-500">{opp.probability}%</span>
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
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Pipeline by Stage</h3>
                  <div className="space-y-4">
                    {pipelineStages.map((stage, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 font-medium group-hover:text-slate-900">{stage.name}</span>
                          <span className="text-slate-900 font-medium">{stage.leads} leads</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-${stage.color}-${stage.color === 'slate' ? '800' : '500'} rounded-full`} style={{width: `${stage.percentage}%`}} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Conversion Trend</h3>
                  <div className="flex h-24 sm:h-32 items-end gap-1.5 sm:gap-2">
                    {conversionData.map((height, idx) => (
                      <div 
                        key={idx}
                        className="flex-1 bg-slate-100 rounded-t-sm hover:bg-indigo-100 transition-colors relative group"
                        style={{height: `${height}%`}}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Activity Feed */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-fit">
              <div className="border-b border-slate-100 px-4 sm:px-6 py-4">
                <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {[
                  { action: 'Deal closed', company: 'Acme Corp', time: '2 hours ago', color: 'emerald' },
                  { action: 'Follow-up scheduled', company: 'Stark Tech', time: '4 hours ago', color: 'blue' },
                  { action: 'Proposal sent', company: 'Wayne Ltd', time: '1 day ago', color: 'purple' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className={`h-8 w-8 rounded-full bg-${activity.color}-100 flex items-center justify-center`}>
                      <div className={`h-2 w-2 rounded-full bg-${activity.color}-500`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-xs text-slate-500">{activity.company} · {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Lead Form Modal */}
      <LeadForm 
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        onSubmit={handleCreateLead}
      />
    </div>
  );
}