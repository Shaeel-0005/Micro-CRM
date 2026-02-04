import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFCF8] text-gray-800 font-sans flex relative overflow-hidden selection:bg-orange-100 selection:text-orange-600">
      
      {/* Background Blob */}
      <div className="fixed top-0 right-0 w-[50vw] h-[50vh] bg-orange-100/40 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4"></div>
      
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-20 lg:px-24 py-12 z-10">
        
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-full bg-[#FF7F40]"></div>
          <span className="text-lg font-medium tracking-tight text-gray-900">Logo</span>
        </div>

        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-8">Please enter your details to sign in.</p>

          <form className="space-y-5">
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
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 text-[#FF7F40] focus:ring-[#FF7F40] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-[#FF7F40] hover:text-[#E66A2E]">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button className="w-full bg-[#FF7F40] hover:bg-[#E66A2E] text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 group">
              Sign in
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Social Auth Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#FFFCF8] text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <button className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-3">
             <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"/>
                <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/>
                <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05"/>
                <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/>
             </svg>
             Google
          </button>

          <p className="text-center mt-8 text-gray-500 text-sm">
            Don't have an account? <Link to="/signup" className="text-[#FF7F40] font-medium hover:text-[#E66A2E]">Sign up</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual / Stats */}
      <div className="hidden lg:flex lg:w-1/2 bg-orange-50/50 relative items-center justify-center p-12">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(#ff7f4010_1px,transparent_1px),linear-gradient(90deg,#ff7f4010_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"></div>

        {/* The "Monthly Report" Card from Landing Page - Reused */}
        <div className="w-[420px] bg-white rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100 z-20 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
            <span className="bg-[#FF7F40] text-white px-2 py-0.5 rounded text-xs font-medium">+12.5%</span>
          </div>

          {/* Simplified Graph Visual */}
          <div className="relative h-40 w-full mb-4">
             {/* Graph Lines BG */}
             <div className="absolute inset-0 right-0 flex flex-col justify-between pointer-events-none">
                <div className="w-full h-px border-t border-dashed border-gray-100"></div>
                <div className="w-full h-px border-t border-dashed border-gray-100"></div>
                <div className="w-full h-px border-t border-dashed border-gray-100"></div>
                <div className="w-full h-px border-t border-dashed border-gray-100"></div>
              </div>
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
               <defs>
                  <linearGradient id="gradientWaveLogin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF7F40" stopOpacity="0.2"></stop>
                    <stop offset="100%" stopColor="#FF7F40" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M0 80 C 40 70, 60 75, 100 80 C 140 85, 140 40, 180 50 C 220 60, 240 70, 300 65 V 100 H 0 Z" fill="url(#gradientWaveLogin)"></path>
                <path d="M0 80 C 40 70, 60 75, 100 80 C 140 85, 140 40, 180 50 C 220 60, 240 70, 300 65" fill="none" stroke="#FF7F40" strokeWidth="3"></path>
            </svg>
          </div>
          
          <div className="text-center">
             <p className="text-2xl font-bold text-gray-900">$24,500</p>
             <p className="text-xs text-gray-400">Total revenue this month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;