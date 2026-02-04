import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';

const SignupPage = () => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.2 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  const drawProgress = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 0.92, // 92%
      opacity: 1,
      transition: { duration: 1.5, ease: "easeInOut", delay: 0.5 }
    }
  };
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFCF8] text-gray-800 font-sans flex relative overflow-hidden selection:bg-orange-100 selection:text-orange-600">
      
      {/* Background Blob */}
      <div className="fixed top-0 right-0 w-[60vw] h-[60vh] bg-orange-100/40 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4"></div>
      
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-20 lg:px-24 py-12 z-10">
        
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-full bg-[#FF7F40]"></div>
          <span className="text-lg font-medium tracking-tight text-gray-900">Logo</span>
        </div>

        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">Create an account</h1>
          <p className="text-gray-500 mb-8">Start your 14-day free trial today.</p>

          <form className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF7F40] focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white/50"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF7F40] focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white/50"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-[#FF7F40] focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white/50"
                  placeholder="Create a password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Must be at least 8 characters.</p>
            </div>

            {/* Terms */}
            <div className="flex items-start pt-2">
              <div className="flex items-center h-5">
                <input 
                  id="terms" 
                  type="checkbox" 
                  className="h-4 w-4 text-[#FF7F40] focus:ring-[#FF7F40] border-gray-300 rounded"
                />
              </div>
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-500">
                I agree to the <a href="#" className="text-gray-900 underline hover:text-[#FF7F40]">Terms of Service</a> and <a href="#" className="text-gray-900 underline hover:text-[#FF7F40]">Privacy Policy</a>.
              </label>
            </div>

            {/* Submit Button */}
            <button className="w-full bg-[#FF7F40] hover:bg-[#E66A2E] text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 group mt-2">
              Create Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          <p className="text-center mt-8 text-gray-500 text-sm">
            Already have an account? <Link to="/login" className="text-[#FF7F40] font-medium hover:text-[#E66A2E]">Log in</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-white relative items-center justify-center p-12 overflow-hidden">
        {/* Background blobs for right side */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-50 rounded-full blur-3xl -z-10"></div>
         
         {/* Feature Card - Sales Stat */}
         <div className="w-[320px] bg-white rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative">
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-medium tracking-tight text-gray-900">Success Rate</h3>
            </div>
            
            {/* Donut Chart */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" stroke="#F3F4F6" strokeWidth="8" fill="none"></circle>
                <circle cx="50" cy="50" r="40" stroke="#FF7F40" strokeWidth="8" fill="none" strokeDasharray="200 251" strokeLinecap="round" className="drop-shadow-lg"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-bold text-gray-900">92%</span>
                 <span className="text-xs text-gray-400 uppercase tracking-wide">Efficiency</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
               <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                     <Check className="w-3 h-3" />
                  </div>
                  <span>Automated workflows</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                     <Check className="w-3 h-3" />
                  </div>
                  <span>AI-driven insights</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SignupPage;