import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, ArrowUpRight, Menu, X } from 'lucide-react';
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';

const Hero = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] text-gray-800 font-sans overflow-x-hidden selection:bg-orange-100 selection:text-orange-600 relative">
      
      {/* Background Decoration */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="fixed top-0 right-0 w-[80vw] md:w-[50vw] h-[50vh] bg-orange-100/40 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4" 
      />

      {/* Navigation */}
      <nav className="w-full px-6 py-6 md:px-12 flex items-center justify-between relative z-50">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF7F40] shadow-lg shadow-orange-500/20"></div>
          <span className="text-lg font-medium tracking-tight text-gray-900">Logo</span>
        </motion.div>

        <div className="hidden md:flex items-center gap-8 text-base font-normal text-gray-500">
          {['Home', 'Features', 'Use Cases', 'Pricing', 'Contacts'].map((item, i) => (
            <motion.a 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={item} href="#" className="hover:text-gray-900 transition-colors"
            >
              {item}
            </motion.a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/login" className="text-base font-medium text-gray-900 hover:text-gray-600">Login</Link>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#FF7F40] text-white text-base font-medium px-6 py-2.5 rounded-lg shadow-lg shadow-orange-500/20"
          >
            Start Free Now
          </motion.button>
        </div>

        <button className="md:hidden text-gray-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-20 left-0 w-full bg-[#FFFCF8] border-b border-gray-100 p-6 z-40 shadow-xl overflow-hidden"
          >
            {/* ... Mobile links here ... */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Hero Section */}
      <main className="w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-12 pb-24 md:pt-20 lg:flex lg:items-center lg:gap-16 relative">
        
        {/* Left Content */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer}
          className="lg:w-1/2 flex flex-col items-start gap-8 z-10"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full shadow-sm">
            <span className="bg-white text-[10px] font-semibold border border-gray-100 px-1.5 py-0.5 rounded text-gray-600 tracking-wide uppercase">New</span>
            <Sparkles className="w-3.5 h-3.5 text-[#FF7F40]" />
            <span className="text-xs font-medium text-gray-600">Powered By Advanced AI</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl tracking-tight text-gray-900 leading-[1.1]">
              <span className="font-normal text-gray-800">AI-Powered</span>{' '}
              <span className="font-semibold block">CRM <span className="font-normal text-gray-800">with</span> precision</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-500 max-w-lg leading-relaxed font-light">
              Automate sales, clients & tasks with intelligent precision. Streamline your workflow effortlessly.
            </motion.p>
          </div>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            <button className="px-8 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all bg-white shadow-sm">
              Book a Demo
            </button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3.5 rounded-xl bg-[#FF7F40] text-white font-medium shadow-xl shadow-orange-500/20"
            >
              Talk to Sales
            </motion.button>
          </motion.div>

          {/* Stats Footer */}
          <motion.div variants={fadeInUp} className="grid grid-cols-3 divide-x divide-gray-200 w-full max-w-md pt-8 md:pt-12">
            {[ {label: 'Companies', val: 214}, {label: 'Countries', val: 190}, {label: 'Founded', val: 2025} ].map((stat, i) => (
              <div key={i} className={i === 0 ? "pr-6" : i === 1 ? "px-6" : "pl-6"}>
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + (i * 0.2) }}
                  className="text-3xl font-medium tracking-tight text-gray-900"
                >{stat.val}</motion.p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Content / Dashboard UI */}
        <div className="lg:w-1/2 mt-20 lg:mt-0 relative h-[500px] md:h-[600px] w-full flex-shrink-0">
          
          {/* Card 1: Sales Stat (Floating) */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 md:right-4 w-[260px] md:w-[280px] bg-white rounded-3xl p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100 z-20"
          >
            <h3 className="text-xl font-medium tracking-tight text-gray-900 mb-6">Sales Stat</h3>
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" stroke="#F3F4F6" strokeWidth="12" fill="none" />
                <motion.circle 
                  cx="50" cy="50" r="40" stroke="#FF7F40" strokeWidth="12" fill="none" 
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 0.7 }}
                  transition={{ duration: 2, delay: 1 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Layers className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Business Invoices */}
          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-48 md:top-40 left-0 md:left-4 w-[220px] md:w-[240px] bg-white rounded-2xl p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100 z-30"
          >
            <h3 className="text-sm font-medium text-gray-900 mb-4">Invoices</h3>
            <div className="flex items-end justify-between h-20 gap-2 mb-4">
              {[0.6, 0.8, 0.5, 0.9, 0.4, 0.7].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h * 100}%` }}
                  transition={{ duration: 1, delay: 1.5 + (i * 0.1) }}
                  className={`w-2 rounded-full ${i % 2 === 0 ? 'bg-orange-200' : 'bg-[#FF7F40]'}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Card 3: Monthly Report (Main Large Card) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute bottom-0 right-0 md:right-8 w-[95%] md:w-[420px] bg-white rounded-2xl p-6 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-gray-100 z-10"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-semibold text-gray-900">Monthly Report</h3>
              <div className="flex gap-2 text-[10px] font-medium text-gray-400">
                <span className="bg-[#FF7F40] text-white px-2 py-0.5 rounded">1W</span>
                <span>1M</span>
              </div>
            </div>
            <div className="relative h-32 w-full">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, delay: 1.2 }}
                  d="M0 80 C 40 70, 60 75, 100 80 C 140 85, 140 40, 180 50 C 220 60, 240 70, 300 65" 
                  fill="none" stroke="#FF7F40" strokeWidth="3"
                />
              </svg>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default Hero;