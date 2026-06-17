/**
 * components/Pipeline.jsx
 * Agency pipeline kanban with drag-and-drop stage changes.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { RefreshCw, AlertCircle, Mail, Phone, DollarSign } from 'lucide-react';
import leadsService, {
  LEAD_SOURCE_DISPLAY,
  LEAD_STATUS_DISPLAY,
  LOST_REASON_DISPLAY,
} from '../services/leadsService';
import LeadDetailPanel from './LeadDetailPanel';

const COLUMNS = [
  { key: 'new_lead', label: 'New Lead', color: 'bg-gray-400', light: 'bg-gray-50', border: 'border-gray-200' },
  { key: 'discovery_call', label: 'Discovery Call', color: 'bg-blue-400', light: 'bg-blue-50', border: 'border-blue-100' },
  { key: 'proposal_sent', label: 'Proposal Sent', color: 'bg-[#FF7F40]', light: 'bg-orange-50', border: 'border-orange-100' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-amber-400', light: 'bg-amber-50', border: 'border-amber-100' },
  { key: 'won', label: 'Won', color: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-100' },
  { key: 'lost', label: 'Lost', color: 'bg-rose-400', light: 'bg-rose-50', border: 'border-rose-100' },
];

function formatDealValue(lead) {
  if (!lead.deal_value) return null;
  const symbol = lead.deal_currency === 'USD' ? '$' : 'Rs ';
  return `${symbol}${Number(lead.deal_value).toLocaleString()}`;
}

function LeadCardContent({ lead, onClick }) {
  const initials = lead.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const dealLabel = formatDealValue(lead);

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start gap-2.5 mb-3">
        <div className="h-8 w-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF7F40] font-semibold text-xs flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
          <p className="text-xs text-gray-500 truncate">{lead.company || '—'}</p>
        </div>
      </div>

      {dealLabel && (
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-emerald-700">
          <DollarSign className="h-3 w-3" />
          {dealLabel}
        </div>
      )}

      <div className="mb-3">
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
          {LEAD_SOURCE_DISPLAY[lead.source] ?? lead.source}
        </span>
      </div>

      <div className="space-y-1">
        {lead.email && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableLeadCard({ lead, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `lead-${lead.id}`,
    data: { lead, type: 'lead' },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.4 : 1 }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCardContent lead={lead} onClick={() => onOpen(lead)} />
    </div>
  );
}

function KanbanColumn({ column, leads, onOpen, loading }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.key}`,
    data: { status: column.key },
  });

  return (
    <div className="flex flex-col min-w-[260px] w-[260px]">
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${column.light} border ${column.border} mb-3`}>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${column.color}`} />
          <span className="text-xs font-semibold text-gray-700">{column.label}</span>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-white rounded-md px-2 py-0.5 border border-gray-100">
          {leads.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 flex-1 min-h-[120px] rounded-xl p-1 transition-colors ${
          isOver ? 'bg-orange-50/60 ring-2 ring-orange-200' : ''
        }`}
      >
        {loading
          ? [...Array(2)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 space-y-2 animate-pulse">
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
                <div className="h-3 w-1/2 bg-gray-100 rounded" />
              </div>
            ))
          : leads.length === 0
            ? (
              <div className={`border-2 border-dashed ${column.border} rounded-xl p-6 text-center`}>
                <p className="text-xs text-gray-400">Drop leads here</p>
              </div>
            )
            : leads.map((lead) => (
                <DraggableLeadCard key={lead.id} lead={lead} onOpen={onOpen} />
              ))}
      </div>
    </div>
  );
}

function LostReasonModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState('ghosted');

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Why was this deal lost?</h3>
        <p className="text-sm text-gray-500 mb-4">Lost reason is required when moving a deal to Lost.</p>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-4"
        >
          {Object.entries(LOST_REASON_DISPLAY).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={() => onConfirm(reason)} className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-medium text-white hover:bg-rose-600">
            Mark as Lost
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pipeline() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLead, setActiveLead] = useState(null);
  const [detailLead, setDetailLead] = useState(null);
  const [pendingLost, setPendingLost] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadsService.getAll();
      const list = Array.isArray(data) ? data : data.results ?? [];
      setLeads(list);
    } catch {
      setError('Failed to load pipeline. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const applyStatusChange = async (leadId, newStatus, lostReason = null) => {
    const payload = { status: newStatus };
    if (newStatus === 'lost') payload.lost_reason = lostReason;

    setLeads((prev) => prev.map((l) => (
      l.id === leadId ? { ...l, status: newStatus, lost_reason: lostReason ?? l.lost_reason } : l
    )));

    try {
      await leadsService.partialUpdate(leadId, payload);
    } catch {
      fetchLeads();
    }
  };

  const handleDragStart = (event) => {
    const lead = event.active.data.current?.lead;
    if (lead) setActiveLead(lead);
  };

  const handleDragEnd = (event) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const lead = active.data.current?.lead;
    if (!lead) return;

    let newStatus = over.data.current?.status;
    if (!newStatus && over.id?.toString().startsWith('column-')) {
      newStatus = over.id.toString().replace('column-', '');
    }

    if (!newStatus || newStatus === lead.status) return;

    if (newStatus === 'lost') {
      setPendingLost({ leadId: lead.id, newStatus });
      return;
    }

    applyStatusChange(lead.id, newStatus);
  };

  const leadsByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = leads.filter((l) => l.status === col.key);
    return acc;
  }, {});

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
        <button onClick={fetchLeads} className="inline-flex items-center gap-2 rounded-lg bg-[#FF7F40] px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-all">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            {leads.length} lead{leads.length !== 1 ? 's' : ''} across all stages
          </p>
        </div>
        <button onClick={fetchLeads} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 flex-1">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.key}
              column={col}
              leads={leadsByStatus[col.key] ?? []}
              onOpen={setDetailLead}
              loading={loading}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? (
            <div className="rotate-2 opacity-90">
              <LeadCardContent lead={activeLead} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {pendingLost && (
        <LostReasonModal
          onCancel={() => setPendingLost(null)}
          onConfirm={(reason) => {
            applyStatusChange(pendingLost.leadId, pendingLost.newStatus, reason);
            setPendingLost(null);
          }}
        />
      )}

      {detailLead && (
        <LeadDetailPanel
          lead={detailLead}
          onClose={() => setDetailLead(null)}
          onUpdate={(id, newStatus) => {
            setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
            setDetailLead((prev) => (prev?.id === id ? { ...prev, status: newStatus } : prev));
          }}
        />
      )}
    </div>
  );
}
