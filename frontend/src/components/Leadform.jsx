import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import {
  LEAD_STATUS_DISPLAY,
  LEAD_SOURCE_DISPLAY,
  LOST_REASON_DISPLAY,
} from '../services/leadsService';

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'new_lead',
  source: 'website',
  deal_value: '',
  deal_currency: 'PKR',
  expected_close_date: '',
  lost_reason: '',
};

export default function LeadForm({ isOpen, onClose, onSubmit, currentUser }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) setShowSuccess(false);
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.status === 'lost' && !formData.lost_reason) {
      newErrors.lost_reason = 'Lost reason is required';
    }
    if (formData.deal_value && Number(formData.deal_value) < 0) {
      newErrors.deal_value = 'Deal value must be positive';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        status: formData.status,
        source: formData.source,
        deal_currency: formData.deal_currency,
        expected_close_date: formData.expected_close_date || undefined,
        assigned_to: currentUser?.id,
      };
      if (formData.deal_value) payload.deal_value = formData.deal_value;
      if (formData.status === 'lost') payload.lost_reason = formData.lost_reason;

      await onSubmit(payload);
      setShowSuccess(true);
      setFormData(INITIAL_FORM);
      setErrors({});
      setTimeout(() => { setShowSuccess(false); onClose(); }, 2000);
    } catch (error) {
      const data = error.response?.data;
      setErrors({
        submit: data?.email?.[0] ?? data?.phone?.[0] ?? data?.lost_reason?.[0] ?? 'Failed to create lead.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]">
          <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 p-4 flex items-center gap-3 min-w-[320px]">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="font-semibold text-slate-900">Lead Created Successfully!</p>
              <p className="text-sm text-slate-600">Your new lead has been added.</p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-slate-900/50 z-50" onClick={!isSubmitting ? onClose : undefined} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Add New Lead</h2>
              <p className="text-sm text-slate-500 mt-0.5">Create a new agency opportunity</p>
            </div>
            <button onClick={onClose} disabled={isSubmitting} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6 space-y-4">
            {errors.submit && (
              <div className="flex gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" /> {errors.submit}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} disabled={isSubmitting}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-200 outline-none" />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={isSubmitting}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-200 outline-none" />
                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={isSubmitting}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-200 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
              <input name="company" value={formData.company} onChange={handleChange} disabled={isSubmitting}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-200 outline-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Stage</label>
                <select name="status" value={formData.status} onChange={handleChange} disabled={isSubmitting}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50">
                  {Object.entries(LEAD_STATUS_DISPLAY).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Source</label>
                <select name="source" value={formData.source} onChange={handleChange} disabled={isSubmitting}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50">
                  {Object.entries(LEAD_SOURCE_DISPLAY).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.status === 'lost' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lost Reason *</label>
                <select name="lost_reason" value={formData.lost_reason} onChange={handleChange} disabled={isSubmitting}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50">
                  <option value="">Select reason...</option>
                  {Object.entries(LOST_REASON_DISPLAY).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                {errors.lost_reason && <p className="text-xs text-rose-600 mt-1">{errors.lost_reason}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Deal Value</label>
                <input type="number" min="0" step="0.01" name="deal_value" value={formData.deal_value} onChange={handleChange} disabled={isSubmitting}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-200 outline-none" />
                {errors.deal_value && <p className="text-xs text-rose-600 mt-1">{errors.deal_value}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                <select name="deal_currency" value={formData.deal_currency} onChange={handleChange} disabled={isSubmitting}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50">
                  <option value="PKR">PKR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Expected Close Date</label>
              <input type="date" name="expected_close_date" value={formData.expected_close_date} onChange={handleChange} disabled={isSubmitting}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-200 outline-none" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-slate-700">Cancel</button>
            <button type="button" onClick={handleSubmit} disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50">
              {isSubmitting ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
