import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Animation Variants ---
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const drawProgress = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 0.92, 
      opacity: 1,
      transition: { duration: 1.8, ease: "easeInOut", delay: 0.8 }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const data = await authAPI.signup(
        formData.username,
        formData.email,
        formData.password
      );
      
      // Store tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error || 
        err.response?.data?.username?.[0] || 
        'Signup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] text-gray-800 font-sans flex relative overflow-hidden selection:bg-orange-100 selection:text-orange-600">
      
      {/* Fixed Background Decoration */}
      <div className="fixed top-0 right-0 w-[60vw] h-[60vh] bg-orange-100/40 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4"></div>
      
      {/* LEFT SIDE: FORM (Now with staggered entry) */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-20 lg:px-24 py-12 z-10"
      >
        {/* Logo */}
        <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-full bg-[#FF7F40] shadow-lg shadow-orange-500/20"></div>
          <span className="text-lg font-medium tracking-tight text-gray-900">LeadFlow</span>
        </motion.div>

        <div className="max-w-md w-full mx-auto">
          <motion.h1 variants={fadeInUp} className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
            Create an account
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-gray-500 mb-8">
            Start your 14-day free trial today.
          </motion.p>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF7F40] transition-colors" />
                </div>
                <input 
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF7F40] focus:ring-4 focus:ring-orange-100 outline-none transition-all bg-white/50 hover:bg-white"
                  placeholder="johndoe"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF7F40] transition-colors" />
                </div>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF7F40] focus:ring-4 focus:ring-orange-100 outline-none transition-all bg-white/50 hover:bg-white"
                  placeholder="name@company.com"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF7F40] transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-[#FF7F40] focus:ring-4 focus:ring-orange-100 outline-none transition-all bg-white/50 hover:bg-white"
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
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF7F40] transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF7F40] focus:ring-4 focus:ring-orange-100 outline-none transition-all bg-white/50 hover:bg-white"
                  placeholder="Confirm your password"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button 
              type="submit"
              disabled={loading}
              variants={fadeInUp}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-[#FF7F40] hover:bg-[#E66A2E] text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 group mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </motion.button>
          </form>

          <motion.p variants={fadeInUp} className="text-center mt-8 text-gray-500 text-sm">
            Already have an account? <Link to="/login" className="text-[#FF7F40] font-medium hover:text-[#E66A2E] underline underline-offset-4">Log in</Link>
          </motion.p>
        </div>
      </motion.div>

      {/* RIGHT SIDE: INTERACTIVE GRAPHICS */}
      <div className="hidden lg:flex lg:w-1/2 bg-white relative items-center justify-center p-12 overflow-hidden">
        
        {/* Breathing Background Blob */}
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-50 rounded-full blur-3xl -z-10"
        />

        {/* Feature Card */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ y: -8, transition: { duration: 0.3 } }}
          className="w-[340px] bg-white rounded-[2rem] p-10 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.12)] border border-gray-100 relative z-10"
        >
          <h3 className="text-xl font-semibold tracking-tight text-gray-900 mb-8">Success Rate</h3>

          {/* Donut Chart Animation */}
          <div className="relative w-48 h-48 mx-auto mb-10">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="42" stroke="#F9FAFB" strokeWidth="10" fill="none" />
              <motion.circle 
                cx="50" cy="50" r="42" 
                stroke="#FF7F40" strokeWidth="10" fill="none" 
                strokeLinecap="round"
                initial="hidden"
                animate="visible"
                variants={drawProgress}
                className="drop-shadow-[0_4px_6px_rgba(255,127,64,0.3)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 1.5 }}
                className="text-4xl font-bold text-gray-900"
              >
                92%
              </motion.span>
              <span className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-bold mt-1">Efficiency</span>
            </div>
          </div>

          {/* Checklist with staggered dots */}
          <div className="space-y-4">
            {["Automated workflows", "AI-driven insights"].map((text, i) => (
              <motion.div 
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 + (i * 0.2) }}
                className="flex items-center gap-4 text-sm font-medium text-gray-600"
              >
                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                  <Check className="w-3.5 h-3.5" />
                </div>
                {text}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Floating Accent Dot */}
        <motion.div 
          animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-3 h-3 bg-orange-300 rounded-full opacity-40 blur-[1px]"
        />
      </div>
    </div>
  );
};

export default SignupPage;