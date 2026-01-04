import React, { useState } from 'react';
import { Sparkles, Layers, ArrowUpRight, Menu, X } from 'lucide-react';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFCF8] text-gray-800 font-sans overflow-x-hidden selection:bg-orange-100 selection:text-orange-600 relative">
      
      {/* Background Decoration */}
      <div className="fixed top-0 right-0 w-[80vw] md:w-[50vw] h-[50vh] bg-orange-100/40 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4"></div>

      {/* Navigation */}
      <nav className="w-full px-6 py-6 md:px-12 flex items-center justify-between relative z-50">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF7F40]"></div>
          <span className="text-lg font-medium tracking-tight text-gray-900">Logo</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-base font-normal text-gray-500">
          {['Home', 'Features', 'Use Cases', 'Pricing', 'Contacts'].map((item) => (
            <a key={item} href="#" className="hover:text-gray-900 transition-colors">
              {item}
            </a>
          ))}
        </div>

        {/* Auth / CTA */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#" className="text-base font-medium text-gray-900 hover:text-gray-600">Login</a>
          <a href="#" className="bg-[#FF7F40] hover:bg-[#E66A2E] text-white text-base font-medium px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-orange-500/20">
            Start Free Now
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#FFFCF8] border-b border-gray-100 p-6 z-40 shadow-xl flex flex-col gap-4">
          {['Home', 'Features', 'Use Cases', 'Pricing', 'Contacts'].map((item) => (
            <a key={item} href="#" className="text-lg text-gray-600 py-2 border-b border-gray-50">
              {item}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-4">
             <a href="#" className="text-center py-2 font-medium text-gray-900">Login</a>
             <a href="#" className="bg-[#FF7F40] text-white text-center py-3 rounded-lg font-medium">Start Free Now</a>
          </div>
        </div>
      )}

      {/* Main Hero Section */}
      <main className="w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-12 pb-24 md:pt-20 lg:flex lg:items-center lg:gap-16 relative">
        
        {/* Left Content */}
        <div className="lg:w-1/2 flex flex-col items-start gap-8 z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full shadow-sm">
            <span className="bg-white text-[10px] font-semibold border border-gray-100 px-1.5 py-0.5 rounded text-gray-600 tracking-wide uppercase">New</span>
            <Sparkles className="w-3.5 h-3.5 text-[#FF7F40]" />
            <span className="text-xs font-medium text-gray-600">Powered By Advanced AI</span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl tracking-tight text-gray-900 leading-[1.1]">
              <span className="font-normal text-gray-800">AI-Powered</span>{' '}
              <span className="font-semibold block">CRM <span className="font-normal text-gray-800">with</span> precision</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-lg leading-relaxed font-light">
              Automate sales, clients & tasks with intelligent precision. streamline your workflow effortlessly.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            <button className="px-8 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all bg-white shadow-sm text-base">
              Book a Demo
            </button>
            <button className="px-8 py-3.5 rounded-xl bg-[#FF7F40] text-white font-medium hover:bg-[#E66A2E] transition-all shadow-xl shadow-orange-500/20 text-base">
              Talk to Sales
            </button>
          </div>

          {/* Stats Footer */}
          <div className="grid grid-cols-3 divide-x divide-gray-200 w-full max-w-md pt-8 md:pt-12">
            <div className="pr-6">
              <p className="text-sm text-gray-400 mb-1">Companies use</p>
              <p className="text-3xl font-medium tracking-tight text-gray-900">214</p>
            </div>
            <div className="px-6">
              <p className="text-sm text-gray-400 mb-1">Country Available</p>
              <p className="text-3xl font-medium tracking-tight text-gray-900">190</p>
            </div>
            <div className="pl-6">
              <p className="text-sm text-gray-400 mb-1">Founded</p>
              <p className="text-3xl font-medium tracking-tight text-gray-900">2025</p>
            </div>
          </div>
        </div>

        {/* Right Content / Dashboard UI */}
        <div className="lg:w-1/2 mt-20 lg:mt-0 relative h-[500px] md:h-[600px] w-full flex-shrink-0 select-none">
          
          {/* Decorative Elements */}
          {/* Star */}
          <div className="absolute top-0 left-0 md:left-20 text-[#FF7F40] animate-pulse">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#FF7F40" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="none"></path>
            </svg>
          </div>
          
          {/* Hand Drawn Arrow */}
          <div className="absolute top-10 left-1/3 text-gray-800 z-0 hidden md:block rotate-12">
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M80 10 C 90 20, 80 50, 40 80"></path>
              <path d="M40 80 L 50 75"></path>
              <path d="M40 80 L 45 65"></path>
            </svg>
          </div>

          {/* Card 1: Sales Stat (Top Right) */}
          <div className="absolute top-0 right-0 md:right-4 w-[260px] md:w-[280px] bg-white rounded-3xl p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100 z-20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium tracking-tight text-gray-900">Sales Stat</h3>
            </div>
            
            {/* Donut Chart Simulation */}
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" stroke="#F3F4F6" strokeWidth="12" fill="none"></circle>
                <circle cx="50" cy="50" r="40" stroke="#F3F4F6" strokeWidth="12" fill="none" strokeDasharray="4 4"></circle>
                <circle cx="50" cy="50" r="40" stroke="#FF7F40" strokeWidth="12" fill="none" strokeDasharray="180 251" strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-2 rounded-full shadow-sm border border-gray-50">
                  <Layers className="w-6 h-6 text-gray-700" />
                </div>
              </div>
              
              {/* Floating percentages */}
              <div className="absolute top-0 left-0 text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100">Now 11%</div>
              <div className="absolute top-2 right-0 text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100">Goal 84%</div>
            </div>

            <p className="text-center text-xs text-gray-400 mb-4 px-2">Keep your info updated to increase the number of interactions</p>
            
            <div className="flex justify-center mb-4">
                 <span className="bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1 rounded-full">All Activity</span>
            </div>

            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF7F40]"></span> Sales Done
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-200"></span> Sales Ongoing
              </div>
            </div>
          </div>

          {/* Card 2: Business Invoices (Middle Left) */}
          <div className="absolute top-48 md:top-40 left-0 md:left-4 w-[220px] md:w-[240px] bg-white rounded-2xl p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100 z-30">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Business Invoices</h3>
              </div>
            </div>

            <div className="flex items-end justify-between h-24 gap-2 mb-4 px-1">
              <div className="w-2 bg-orange-200 rounded-full h-[60%]"></div>
              <div className="w-2 bg-[#FF7F40] rounded-full h-[80%]"></div>
              <div className="w-2 bg-orange-200 rounded-full h-[50%]"></div>
              <div className="w-2 bg-[#FF7F40] rounded-full h-[90%]"></div>
              <div className="w-2 bg-orange-200 rounded-full h-[40%]"></div>
              <div className="w-2 bg-[#FF7F40] rounded-full h-[70%]"></div>
            </div>
            
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <div>
                <div className="text-lg font-semibold text-gray-900">520</div>
                <div className="text-[10px] text-orange-500 font-medium">+12%</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#FF7F40]">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 3: Monthly Report (Bottom) */}
          <div className="absolute bottom-0 right-0 md:right-8 w-[95%] md:w-[420px] bg-white rounded-2xl p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100 z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-semibold text-gray-900">Monthly Report</h3>
              <div className="flex gap-3 text-[10px] font-medium text-gray-400">
                <span>1H</span>
                <span>1D</span>
                <span className="bg-[#FF7F40] text-white px-2 py-0.5 rounded">1W</span>
                <span>1M</span>
                <span>1Y</span>
              </div>
            </div>

            {/* Graph Area */}
            <div className="relative h-32 w-full">
              {/* Y Axis Labels */}
              <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between text-[9px] text-gray-300 text-right w-6">
                <span>15K</span>
                <span>10K</span>
                <span>5K</span>
                <span>0K</span>
              </div>
              
              {/* Graph Lines BG */}
              <div className="absolute inset-0 right-8 flex flex-col justify-between pointer-events-none">
                <div className="w-full h-px border-t border-dashed border-gray-100"></div>
                <div className="w-full h-px border-t border-dashed border-gray-100"></div>
                <div className="w-full h-px border-t border-dashed border-gray-100"></div>
                <div className="w-full h-px border-t border-dashed border-gray-100"></div>
              </div>

              {/* SVG Curve */}
              <svg className="absolute inset-0 w-[92%] h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                <defs>
                  <linearGradient id="gradientWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF7F40" stopOpacity="0.2"></stop>
                    <stop offset="100%" stopColor="#FF7F40" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                {/* Filled Area */}
                <path d="M0 80 C 40 70, 60 75, 100 80 C 140 85, 140 40, 180 50 C 220 60, 240 70, 300 65 V 100 H 0 Z" fill="url(#gradientWave)"></path>
                {/* Stroke Line */}
                <path d="M0 80 C 40 70, 60 75, 100 80 C 140 85, 140 40, 180 50 C 220 60, 240 70, 300 65" fill="none" stroke="#FF7F40" strokeWidth="2"></path>
              </svg>
            </div>
            
            {/* X Axis */}
            <div className="flex justify-between w-[90%] mt-2 text-[9px] text-gray-300">
              <span>0</span>
              <span>1:30</span>
              <span>3:00</span>
              <span>6:00</span>
              <span>12:00</span>
              <span>18:00</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default LandingPage;