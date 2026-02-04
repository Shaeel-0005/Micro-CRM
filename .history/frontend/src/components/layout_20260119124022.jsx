import React, { useState } from 'react';
import { DollarSign, Target, PieChart, Briefcase, ChevronUp, TrendingDown } from 'lucide-react';

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

export default function Overview() {
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
    <div>
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