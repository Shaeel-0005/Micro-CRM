import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Mail, Phone, MoreVertical, Star, StarOff, Edit, Trash2, X, Building2, User, MapPin, Calendar, DollarSign, Tag } from 'lucide-react';
import leadsService from '../services/leadsService';

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'new',
    notes: '',
    source: 'other'
  });

  // Fetch contacts from backend on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leadsService.getAll();
      
      // Transform backend data to match frontend format
      const transformedContacts = data.map(lead => ({
        id: lead.id,
        name: lead.name,
        company: lead.company || 'N/A',
        email: lead.email,
        phone: lead.phone || 'N/A',
        status: mapBackendStatus(lead.status),
        value: 0, // You might want to add this field to backend
        stage: mapBackendStatusToStage(lead.status),
        avatar: lead.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        color: 'orange',
        tags: [lead.source || 'other'],
        lastContact: formatDate(lead.created_at),
        location: 'N/A', // Add this field to backend if needed
        starred: false,
        notes: lead.notes || ''
      }));
      
      setContacts(transformedContacts);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Map backend status to frontend status
  const mapBackendStatus = (backendStatus) => {
    const statusMap = {
      'new': 'cold',
      'contacted': 'warm',
      'in_progress': 'warm',
      'won': 'hot',
      'lost': 'cold'
    };
    return statusMap[backendStatus] || 'cold';
  };

  // Map backend status to stage
  const mapBackendStatusToStage = (backendStatus) => {
    const stageMap = {
      'new': 'Discovery',
      'contacted': 'Contacted',
      'in_progress': 'Proposal',
      'won': 'Negotiation',
      'lost': 'Qualified'
    };
    return stageMap[backendStatus] || 'Discovery';
  };

  // Map frontend status to backend status
  const mapFrontendStatus = (frontendStatus) => {
    const statusMap = {
      'hot': 'won',
      'warm': 'in_progress',
      'cold': 'new'
    };
    return statusMap[frontendStatus] || 'new';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'hot': return 'bg-rose-100 text-rose-700 ring-rose-200';
      case 'warm': return 'bg-amber-100 text-amber-700 ring-amber-200';
      case 'cold': return 'bg-blue-100 text-blue-700 ring-blue-200';
      default: return 'bg-gray-100 text-gray-700 ring-gray-200';
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contact.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleStar = (id) => {
    setContacts(contacts.map(contact => 
      contact.id === id ? { ...contact, starred: !contact.starred } : contact
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare data for backend
      const backendData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        status: mapFrontendStatus(formData.status),
        source: formData.source || 'other',
        notes: formData.notes || ''
      };

      // Create lead via API
      const newLead = await leadsService.create(backendData);
      
      // Refresh contacts list
      await fetchContacts();
      
      // Close modal and reset form
      setIsAddingContact(false);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'new',
        notes: '',
        source: 'other'
      });
    } catch (err) {
      console.error('Error creating contact:', err);
      alert('Failed to create contact. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      await leadsService.delete(id);
      await fetchContacts(); // Refresh the list
      setSelectedContact(null); // Close modal if open
    } catch (err) {
      console.error('Error deleting contact:', err);
      alert('Failed to delete contact. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F40] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchContacts}
            className="mt-4 px-4 py-2 bg-[#FF7F40] text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
            <p className="text-sm text-gray-500 mt-1">{contacts.length} total contacts</p>
          </div>
          <button 
            onClick={() => setIsAddingContact(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF7F40] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none ring-orange-200 transition-all focus:ring-2 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('hot')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'hot' ? 'bg-rose-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Hot
            </button>
            <button
              onClick={() => setFilterStatus('warm')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'warm' ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Warm
            </button>
            <button
              onClick={() => setFilterStatus('cold')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'cold' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Cold
            </button>
          </div>
        </div>
      </div>

      {/* Contacts Grid */}
      <div>
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No contacts found. Add your first contact!</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7F40] font-semibold`}>
                        {contact.avatar}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{contact.name}</h3>
                        <p className="text-xs text-gray-500">{contact.company}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(contact.id);
                      }}
                      className="text-gray-400 hover:text-amber-500 transition-colors"
                    >
                      {contact.starred ? <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> : <StarOff className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{contact.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(contact.status)}`}>
                      {contact.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{contact.lastContact}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Contact</th>
                    <th className="px-6 py-3 text-left">Company</th>
                    <th className="px-6 py-3 text-left">Contact Info</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Stage</th>
                    <th className="px-6 py-3 text-left">Last Contact</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredContacts.map(contact => (
                    <tr
                      key={contact.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7F40] font-semibold text-sm`}>
                            {contact.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{contact.name}</p>
                            <p className="text-xs text-gray-500">{contact.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{contact.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(contact.status)}`}>
                          {contact.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-[#FF7F40] ring-1 ring-inset ring-orange-100">
                          {contact.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">{contact.lastContact}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(contact.id);
                            }}
                            className="text-gray-400 hover:text-amber-500 transition-colors"
                          >
                            {contact.starred ? <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> : <StarOff className="h-4 w-4" />}
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(contact.id);
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedContact(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Contact Details</h2>
              <button onClick={() => setSelectedContact(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className={`h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7F40] font-semibold text-xl`}>
                  {selectedContact.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedContact.name}</h3>
                  <p className="text-gray-600">{selectedContact.company}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(selectedContact.status)}`}>
                      {selectedContact.status.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-[#FF7F40] ring-1 ring-inset ring-orange-100">
                      {selectedContact.stage}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="text-sm text-gray-900 pl-6">{selectedContact.email}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">Phone</span>
                  </div>
                  <p className="text-sm text-gray-900 pl-6">{selectedContact.phone}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Last Contact</span>
                  </div>
                  <p className="text-sm text-gray-900 pl-6">{selectedContact.lastContact}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">Source</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pl-6">
                    {selectedContact.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedContact.notes && (
                  <div className="sm:col-span-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-medium">Notes</span>
                    </div>
                    <p className="text-sm text-gray-900 pl-6">{selectedContact.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleDelete(selectedContact.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Contact
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF7F40] px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-all">
                  <Mail className="h-4 w-4" />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {isAddingContact && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4" onClick={() => setIsAddingContact(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Add New Contact</h2>
              <button onClick={() => setIsAddingContact(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent"
                  >
                    <option value="website">Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="email">Email</option>
                    <option value="referral">Referral</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent"
                    placeholder="Add any additional notes about this contact..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddingContact(false)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#FF7F40] px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-all"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}