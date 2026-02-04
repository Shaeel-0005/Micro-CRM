import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

export default function LeadForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new',
    source: 'website',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset success message when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'new',
        source: 'website',
        notes: ''
      });
      setErrors({});
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: error.message || 'Failed to create lead. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Success Toast - Top Center */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 overflow-hidden min-w-[320px]">
            {/* Progress Bar */}
            <div className="h-1 bg-emerald-100">
              <div 
                className="h-full bg-emerald-500 animate-progress"
                style={{
                  animation: 'progress 2s linear forwards'
                }}
              />
            </div>
            
            {/* Content */}
            <div className="p-4 flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600 animate-in zoom-in duration-300" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Lead Created Successfully!</p>
                <p className="text-sm text-slate-600 mt-0.5">Your new lead has been added to the system.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 z-50 transition-opacity duration-300"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Add New Lead</h2>
              <p className="text-sm text-slate-500 mt-0.5">Create a new lead opportunity</p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
            <div className="p-6 space-y-5">
              {/* Error Alert */}
              {errors.submit && (
                <div className="flex gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg animate-in slide-in-from-top duration-200">
                  <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-rose-900">Error</p>
                    <p className="text-sm text-rose-700 mt-1">{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.name 
                      ? 'border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-200' 
                      : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-transparent'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-xs text-rose-600 mt-1.5 animate-in slide-in-from-top duration-150">{errors.name}</p>
                )}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.email 
                        ? 'border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-200' 
                        : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-transparent'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-600 mt-1.5 animate-in slide-in-from-top duration-150">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-lg transition-all outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                  Company <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.company 
                      ? 'border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-200' 
                      : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-transparent'
                  }`}
                  placeholder="Acme Corp"
                />
                {errors.company && (
                  <p className="text-xs text-rose-600 mt-1.5 animate-in slide-in-from-top duration-150">{errors.company}</p>
                )}
              </div>

              {/* Status & Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-lg transition-all outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-slate-700 mb-2">
                    Source
                  </label>
                  <select
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-lg transition-all outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="cold_call">Cold Call</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="event">Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-lg transition-all outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Add any additional information about this lead..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Lead'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}