import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabase';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  total_spots: number;
  spots_remaining: number;
  created_at: string;
}

interface EventFormData {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  total_spots: number;
}

interface VolunteerRegistration {
  id: string;
  registered_at: string;
  volunteer_profiles: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

const EMPTY_FORM: EventFormData = {
  name: '',
  description: '',
  date: '',
  time: '',
  location: '',
  total_spots: 10,
};

interface ToastState {
  type: 'success' | 'error';
  text: string;
}

const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL
  ? `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1`
  : '';

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [search, setSearch] = useState('');
  const [viewFilter, setViewFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  // Registrations modal state
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<VolunteerRegistration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [regSearch, setRegSearch] = useState('');

  // Event form state
  const [notifyOnEdit, setNotifyOnEdit] = useState(true);
  const [notifyOnDelete, setNotifyOnDelete] = useState(true);
  const [sendingNotif, setSendingNotif] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      if (error) throw error;
      setEvents((data || []) as Event[]);
    } catch {
      showToast('error', 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const openRegistrations = async (event: Event) => {
    setViewingEvent(event);
    setRegSearch('');
    setLoadingRegs(true);
    try {
      const { data, error } = await supabase
        .from('volunteer_events')
        .select(`
          id,
          registered_at,
          volunteer_profiles (
            full_name,
            email,
            phone
          )
        `)
        .eq('event_id', event.id)
        .order('registered_at', { ascending: true });
      if (error) throw error;
      setRegistrations((data || []) as unknown as VolunteerRegistration[]);
    } catch {
      showToast('error', 'Failed to load registrations.');
    } finally {
      setLoadingRegs(false);
    }
  };

  const closeRegistrations = () => {
    setViewingEvent(null);
    setRegistrations([]);
    setRegSearch('');
  };

  const filteredRegs = registrations.filter((r) => {
    if (!regSearch) return true;
    const q = regSearch.toLowerCase();
    return (
      r.volunteer_profiles?.full_name?.toLowerCase().includes(q) ||
      r.volunteer_profiles?.email?.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditingEvent(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      total_spots: event.total_spots,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'total_spots' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const sendNotification = async (
    eventId: string,
    type: 'edited' | 'cancelled',
    updatedFields?: string[]
  ) => {
    try {
      setSendingNotif(true);
      await fetch(`${SUPABASE_FUNCTIONS_URL}/notify-event-volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, type, updatedFields }),
      });
    } catch {
      // Notification failure is non-blocking
    } finally {
      setSendingNotif(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.date || !formData.time || !formData.location.trim()) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      if (editingEvent) {
        const spotsUsed = editingEvent.total_spots - editingEvent.spots_remaining;
        const newSpotsRemaining = Math.max(0, formData.total_spots - spotsUsed);

        // Detect what changed for the notification
        const changedFields: string[] = [];
        if (formData.name.trim() !== editingEvent.name) changedFields.push(`Name changed to: ${formData.name.trim()}`);
        if (formData.date !== editingEvent.date) changedFields.push(`Date changed to: ${new Date(formData.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`);
        if (formData.time !== editingEvent.time) changedFields.push(`Time changed to: ${formData.time}`);
        if (formData.location.trim() !== editingEvent.location) changedFields.push(`Location changed to: ${formData.location.trim()}`);
        if (formData.total_spots !== editingEvent.total_spots) changedFields.push(`Total spots changed to: ${formData.total_spots}`);

        const { error } = await supabase
          .from('events')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim(),
            date: formData.date,
            time: formData.time,
            location: formData.location.trim(),
            total_spots: formData.total_spots,
            spots_remaining: newSpotsRemaining,
          })
          .eq('id', editingEvent.id);
        if (error) throw error;

        // Send notification if toggled on and something changed
        if (notifyOnEdit && changedFields.length > 0) {
          await sendNotification(editingEvent.id, 'edited', changedFields);
          showToast('success', 'Event updated & volunteers notified by email!');
        } else {
          showToast('success', 'Event updated successfully!');
        }
      } else {
        const { error } = await supabase.from('events').insert({
          name: formData.name.trim(),
          description: formData.description.trim(),
          date: formData.date,
          time: formData.time,
          location: formData.location.trim(),
          total_spots: formData.total_spots,
          spots_remaining: formData.total_spots,
        });
        if (error) throw error;
        showToast('success', 'Event created successfully!');
      }
      closeForm();
      await loadEvents();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      // Send cancellation notification BEFORE deleting (so we can still fetch registrations)
      if (notifyOnDelete) {
        await sendNotification(deleteConfirm.id, 'cancelled');
      }

      await supabase.from('volunteer_events').delete().eq('event_id', deleteConfirm.id);
      const { error } = await supabase.from('events').delete().eq('id', deleteConfirm.id);
      if (error) throw error;

      showToast('success', notifyOnDelete ? 'Event deleted & volunteers notified.' : 'Event deleted.');
      setDeleteConfirm(null);
      await loadEvents();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete event.');
    } finally {
      setDeleting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const filtered = events.filter((ev) => {
    const matchSearch =
      !search ||
      ev.name.toLowerCase().includes(search.toLowerCase()) ||
      ev.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      viewFilter === 'all'
        ? true
        : viewFilter === 'upcoming'
        ? ev.date >= today
        : ev.date < today;
    return matchSearch && matchFilter;
  });

  const upcomingCount = events.filter((e) => e.date >= today).length;
  const pastCount = events.filter((e) => e.date < today).length;

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const formatDateTime = (isoStr: string) =>
    new Date(isoStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const spotsPercent = (ev: Event) =>
    ev.total_spots > 0
      ? Math.round(((ev.total_spots - ev.spots_remaining) / ev.total_spots) * 100)
      : 0;

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-semibold text-sm flex items-center gap-3 transition-all ${
            toast.type === 'success' ? 'bg-lime-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          <i className={toast.type === 'success' ? 'ri-check-line text-xl' : 'ri-error-warning-line text-xl'}></i>
          {toast.text}
        </div>
      )}

      {/* Sending notification overlay */}
      {sendingNotif && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl font-semibold text-sm flex items-center gap-3">
          <i className="ri-mail-send-line text-yellow-400 text-lg animate-pulse"></i>
          Sending email notifications…
        </div>
      )}

      {/* Registrations Modal */}
      {viewingEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Registered Volunteers</h2>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{viewingEvent.name}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <i className="ri-calendar-line"></i>
                    {formatDate(viewingEvent.date)} · {viewingEvent.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-map-pin-line"></i>
                    {viewingEvent.location}
                  </span>
                </div>
              </div>
              <button
                onClick={closeRegistrations}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all cursor-pointer text-gray-500 flex-shrink-0 ml-4"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Stats bar */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-6 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center">
                  <i className="ri-group-fill text-gray-900 text-sm"></i>
                </div>
                <div>
                  <div className="text-lg font-black text-gray-900 leading-none">
                    {viewingEvent.total_spots - viewingEvent.spots_remaining}
                  </div>
                  <div className="text-xs text-gray-500">Registered</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-xl flex items-center justify-center">
                  <i className="ri-user-add-line text-gray-600 text-sm"></i>
                </div>
                <div>
                  <div className="text-lg font-black text-gray-900 leading-none">
                    {viewingEvent.spots_remaining}
                  </div>
                  <div className="text-xs text-gray-500">Spots Left</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Capacity</span>
                  <span>{spotsPercent(viewingEvent)}% full</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      spotsPercent(viewingEvent) >= 90
                        ? 'bg-red-400'
                        : spotsPercent(viewingEvent) >= 60
                        ? 'bg-yellow-400'
                        : 'bg-lime-400'
                    }`}
                    style={{ width: `${spotsPercent(viewingEvent)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <i className="ri-search-line text-gray-400 text-sm"></i>
                </div>
                <input
                  type="text"
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                />
                {regSearch && (
                  <button
                    onClick={() => setRegSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className="ri-close-line text-sm"></i>
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingRegs ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <i className="ri-loader-4-line text-4xl animate-spin mb-3"></i>
                  <p className="font-semibold text-sm">Loading registrations…</p>
                </div>
              ) : registrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i className="ri-group-line text-3xl"></i>
                  </div>
                  <p className="font-bold text-gray-600">No volunteers registered yet</p>
                  <p className="text-sm mt-1">Volunteers will appear here once they sign up.</p>
                </div>
              ) : filteredRegs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <i className="ri-search-line text-4xl mb-3"></i>
                  <p className="font-semibold">No results for &quot;{regSearch}&quot;</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRegs.map((reg, idx) => (
                    <div
                      key={reg.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-yellow-50 rounded-xl border border-gray-100 hover:border-yellow-200 transition-all"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 font-black text-gray-900 text-sm">
                        {reg.volunteer_profiles?.full_name
                          ? reg.volunteer_profiles.full_name.charAt(0).toUpperCase()
                          : '?'}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-sm truncate">
                          {reg.volunteer_profiles?.full_name || 'Unknown'}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-0.5">
                          <span className="text-xs text-gray-500 flex items-center gap-1 truncate">
                            <i className="ri-mail-line flex-shrink-0"></i>
                            {reg.volunteer_profiles?.email || '—'}
                          </span>
                          {reg.volunteer_profiles?.phone && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <i className="ri-phone-line flex-shrink-0"></i>
                              {reg.volunteer_profiles.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Registered at + number */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-bold text-gray-400">#{idx + 1}</div>
                        <div className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">
                          {formatDateTime(reg.registered_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={closeRegistrations}
                className="w-full py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-fill text-red-500 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Event?</h3>
            <p className="text-gray-600 text-sm text-center mb-1">
              <span className="font-semibold">{deleteConfirm.name}</span>
            </p>
            <p className="text-gray-500 text-xs text-center mb-4">
              This will also remove all volunteer registrations for this event. This cannot be undone.
            </p>

            {/* Notify toggle */}
            <label className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 cursor-pointer">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={notifyOnDelete}
                  onChange={(e) => setNotifyOnDelete(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${notifyOnDelete ? 'bg-red-500' : 'bg-gray-300'}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifyOnDelete ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Notify registered volunteers</p>
                <p className="text-xs text-gray-500">Send a cancellation email to all {deleteConfirm.total_spots - deleteConfirm.spots_remaining} registered volunteer(s)</p>
              </div>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-sm text-white transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <i className="ri-loader-4-line animate-spin"></i>
                ) : (
                  <i className="ri-delete-bin-line"></i>
                )}
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {editingEvent ? 'Update the event details below.' : 'Fill in the details for the new event.'}
                </p>
              </div>
              <button
                onClick={closeForm}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all cursor-pointer text-gray-500"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Naloxone Training Session"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the event…"
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{formData.description.length}/500</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={today}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Plymouth Community Centre"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Total Spots <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="total_spots"
                  value={formData.total_spots}
                  onChange={handleChange}
                  min={1}
                  max={500}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                  required
                />
                {editingEvent && (
                  <p className="text-xs text-gray-400 mt-1">
                    Currently {editingEvent.total_spots - editingEvent.spots_remaining} volunteer(s) registered.
                    Reducing spots below this number will set remaining spots to 0.
                  </p>
                )}
              </div>

              {/* Notify toggle — only shown when editing */}
              {editingEvent && (
                <label className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 cursor-pointer">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={notifyOnEdit}
                      onChange={(e) => setNotifyOnEdit(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${notifyOnEdit ? 'bg-yellow-400' : 'bg-gray-300'}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifyOnEdit ? 'translate-x-5' : 'translate-x-1'}`}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Notify registered volunteers</p>
                    <p className="text-xs text-gray-500">Send an update email to all {editingEvent.total_spots - editingEvent.spots_remaining} registered volunteer(s)</p>
                  </div>
                </label>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 font-bold text-sm text-gray-900 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-md"
                >
                  {saving ? (
                    <i className="ri-loader-4-line animate-spin"></i>
                  ) : (
                    <i className={editingEvent ? 'ri-save-line' : 'ri-add-line'}></i>
                  )}
                  {saving ? 'Saving…' : editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage events that volunteers can register for.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-md"
        >
          <i className="ri-add-circle-fill text-lg"></i>
          Create New Event
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Events', value: events.length, icon: 'ri-calendar-event-fill', bg: 'bg-gray-900', text: 'text-white', sub: 'text-gray-400' },
          { label: 'Upcoming', value: upcomingCount, icon: 'ri-calendar-check-fill', bg: 'bg-yellow-400', text: 'text-gray-900', sub: 'text-gray-700' },
          { label: 'Past Events', value: pastCount, icon: 'ri-history-fill', bg: 'bg-gray-200', text: 'text-gray-700', sub: 'text-gray-500' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 shadow-sm`}>
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <i className={`${s.icon} ${s.text} text-lg`}></i>
            </div>
            <div className={`text-3xl font-bold ${s.text} mb-0.5`}>{s.value}</div>
            <div className={`text-xs font-semibold ${s.sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(['upcoming', 'past', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setViewFilter(f)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer whitespace-nowrap capitalize ${
                  viewFilter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f === 'upcoming' ? `Upcoming (${upcomingCount})` : f === 'past' ? `Past (${pastCount})` : `All (${events.length})`}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
              <i className="ri-search-line text-gray-400 text-base"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
        </div>

        {/* Events List */}
        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <i className="ri-loader-4-line text-5xl animate-spin mb-3"></i>
              <p className="font-semibold">Loading events…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <i className="ri-calendar-event-line text-5xl mb-3"></i>
              <p className="font-semibold text-lg">No events found</p>
              <p className="text-sm mt-1">
                {search ? 'Try a different search term.' : viewFilter === 'upcoming' ? 'No upcoming events. Create one!' : 'No past events.'}
              </p>
              {!search && viewFilter === 'upcoming' && (
                <button
                  onClick={openCreate}
                  className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  Create First Event
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((ev) => {
                const isPast = ev.date < today;
                const pct = spotsPercent(ev);
                const registered = ev.total_spots - ev.spots_remaining;
                return (
                  <div
                    key={ev.id}
                    className={`border rounded-2xl p-5 transition-all ${
                      isPast ? 'border-gray-200 bg-gray-50 opacity-75' : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${isPast ? 'bg-gray-200' : 'bg-yellow-400'}`}>
                          <span className={`text-xs font-bold uppercase ${isPast ? 'text-gray-500' : 'text-gray-700'}`}>
                            {new Date(ev.date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short' })}
                          </span>
                          <span className={`text-2xl font-black leading-none ${isPast ? 'text-gray-600' : 'text-gray-900'}`}>
                            {new Date(ev.date + 'T00:00:00').getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-base truncate">{ev.name}</h3>
                            {isPast && (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-500">Past</span>
                            )}
                            {!isPast && ev.spots_remaining === 0 && (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-600">Full</span>
                            )}
                          </div>
                          {ev.description && (
                            <p className="text-sm text-gray-500 mb-2 line-clamp-1">{ev.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <i className="ri-time-line"></i>
                              {formatDate(ev.date)} · {ev.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-map-pin-line"></i>
                              {ev.location}
                            </span>
                          </div>
                          {/* Spots bar */}
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : pct >= 60 ? 'bg-yellow-400' : 'bg-lime-400'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                              {registered}/{ev.total_spots} registered
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openRegistrations(ev)}
                          className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                        >
                          <i className="ri-group-line"></i>
                          View ({registered})
                        </button>
                        <button
                          onClick={() => openEdit(ev)}
                          className="bg-gray-100 hover:bg-yellow-100 text-gray-700 hover:text-yellow-800 px-4 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                        >
                          <i className="ri-edit-line"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(ev)}
                          className="bg-red-50 hover:bg-red-100 text-red-500 px-4 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                        >
                          <i className="ri-delete-bin-line"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
