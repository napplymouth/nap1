import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Timeslot {
  start_time: string;
  end_time: string;
}

interface BookingCalendarProps {
  timeslotsApi: string;
  appointmentsApi: string;
  texts: {
    stepDateTitle: string;
    stepTimeTitle: string;
    stepFormTitle: string;
    prevMonth: string;
    nextMonth: string;
    selectTime: string;
    modifyTime: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    submitButton: string;
    submitting: string;
    successMessage: string;
    successSub: string;
    bookAnother: string;
    noSlots: string;
    selectedDate: string;
    selectedTime: string;
    back: string;
    required: string;
    dayNames: string[];
    monthNames: string[];
  };
  containerStyle?: React.CSSProperties;
  formSubmitUrl?: string;
}

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function extractDate(startTime: string): string {
  return startTime.split(' ')[0];
}

function extractTime(timeStr: string): string {
  const parts = timeStr.split(' ');
  if (parts.length < 2) return '';
  return parts[1].substring(0, 5);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function BookingCalendar({
  timeslotsApi,
  appointmentsApi,
  texts,
  containerStyle,
  formSubmitUrl,
}: BookingCalendarProps) {
  const navigate = useNavigate();
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Timeslot | null>(null);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const fetchTimeslots = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(timeslotsApi);
      const data = await res.json();
      const slots: Timeslot[] = Array.isArray(data) ? data : (data.data || data.timeslots || []);
      setTimeslots(slots);
      return slots;
    } catch {
      setTimeslots([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [timeslotsApi]);

  useEffect(() => {
    fetchTimeslots().then((slots) => {
      if (slots.length === 0) return;
      const today = getTodayString();
      const availableDates = [...new Set(slots.map((s) => extractDate(s.start_time)))].sort();
      const futureDates = availableDates.filter((d) => d >= today);
      const closestDate = futureDates.length > 0 ? futureDates[0] : availableDates[availableDates.length - 1];
      if (closestDate) {
        setSelectedDate(closestDate);
        const parts = closestDate.split('-');
        setCalendarYear(parseInt(parts[0], 10));
        setCalendarMonth(parseInt(parts[1], 10) - 1);
      }
    });
  }, [fetchTimeslots]);

  const availableDateSet = useMemo(() => {
    return new Set(timeslots.map((s) => extractDate(s.start_time)));
  }, [timeslots]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return timeslots.filter((s) => extractDate(s.start_time) === selectedDate);
  }, [timeslots, selectedDate]);

  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDay = getFirstDayOfWeek(calendarYear, calendarMonth);

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarYear(calendarYear - 1);
      setCalendarMonth(11);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarYear(calendarYear + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const handleDateClick = (dateStr: string) => {
    if (availableDateSet.has(dateStr)) {
      setSelectedDate(dateStr);
      setSelectedSlot(null);
      setCurrentStep(1);
    }
  };

  const handleSlotClick = (slot: Timeslot) => {
    setSelectedSlot(slot);
    setCurrentStep(2);
  };

  const handleEmailContinue = () => {
    if (!email.trim()) {
      setEmailError('Email address is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    if (!selectedSlot) return;
    const startTime = extractTime(selectedSlot.start_time);
    const endTime = extractTime(selectedSlot.end_time);
    navigate(
      `/booking?date=${selectedDate}&start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}&email=${encodeURIComponent(email)}`
    );
  };

  const calendarCells: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(calendarMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    calendarCells.push(`${calendarYear}-${mm}-${dd}`);
  }

  if (loading && timeslots.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 text-sm">Loading available sessions...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[texts.stepDateTitle, texts.stepTimeTitle, 'Your Email'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                currentStep === i
                  ? 'bg-pink-500 text-white shadow-lg'
                  : currentStep > i
                  ? 'bg-lime-400 text-gray-900'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > i ? <i className="ri-check-line"></i> : i + 1}
            </div>
            <span
              className={`text-sm font-semibold hidden sm:inline ${
                currentStep === i ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
            {i < 2 && <div className="w-8 h-0.5 bg-gray-200 mx-1"></div>}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-200 mx-1"></div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-gray-200 text-gray-500">
            4
          </div>
          <span className="text-sm font-semibold hidden sm:inline text-gray-400">
            {texts.stepFormTitle}
          </span>
        </div>
      </div>

      {/* Step 0: Date Selection */}
      {currentStep === 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all cursor-pointer"
            >
              <i className="ri-arrow-left-s-line text-xl text-gray-700"></i>
            </button>
            <h3 className="text-xl font-bold text-gray-900">
              {texts.monthNames[calendarMonth]} {calendarYear}
            </h3>
            <button
              onClick={handleNextMonth}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all cursor-pointer"
            >
              <i className="ri-arrow-right-s-line text-xl text-gray-700"></i>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {texts.dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((dateStr, idx) => {
              if (!dateStr) return <div key={`empty-${idx}`} className="h-12"></div>;
              const dayNum = parseInt(dateStr.split('-')[2], 10);
              const isAvailable = availableDateSet.has(dateStr);
              const isSelected = dateStr === selectedDate;
              const today = getTodayString();
              const isPast = dateStr < today;
              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(dateStr)}
                  disabled={!isAvailable}
                  className={`h-12 rounded-lg text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-pink-500 text-white shadow-lg'
                      : isAvailable
                      ? 'bg-yellow-400/20 text-gray-900 hover:bg-yellow-400 hover:text-gray-900 cursor-pointer'
                      : isPast
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {availableDateSet.size === 0 && (
            <p className="text-center text-gray-500 mt-6 text-sm">{texts.noSlots}</p>
          )}
        </div>
      )}

      {/* Step 1: Time Slot Selection */}
      {currentStep === 1 && (
        <div>
          <button
            onClick={() => setCurrentStep(0)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer transition-colors"
          >
            <i className="ri-arrow-left-line text-lg"></i>
            <span className="text-sm font-semibold">{texts.back}</span>
          </button>

          <div className="bg-yellow-400/10 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <i className="ri-calendar-fill text-gray-900 text-lg"></i>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold">{texts.selectedDate}</span>
                <p className="text-gray-900 font-bold">{selectedDate}</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4">{texts.selectTime}</h3>

          {slotsForSelectedDate.length === 0 ? (
            <p className="text-gray-500 text-sm">{texts.noSlots}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slotsForSelectedDate.map((slot, i) => {
                const startTime = extractTime(slot.start_time);
                const endTime = extractTime(slot.end_time);
                const isSelected = selectedSlot?.start_time === slot.start_time;
                return (
                  <button
                    key={i}
                    onClick={() => handleSlotClick(slot)}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-pink-500 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-900 hover:bg-yellow-400 border border-gray-200 hover:border-yellow-400'
                    }`}
                  >
                    {startTime} – {endTime}
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-6 text-center flex items-center justify-center gap-1">
            <i className="ri-arrow-right-circle-line text-pink-400"></i>
            Selecting a time will take you to the next step
          </p>
        </div>
      )}

      {/* Step 2: Email Capture */}
      {currentStep === 2 && selectedSlot && (
        <div>
          <button
            onClick={() => { setCurrentStep(1); setSelectedSlot(null); setEmail(''); setEmailError(''); }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer transition-colors"
          >
            <i className="ri-arrow-left-line text-lg"></i>
            <span className="text-sm font-semibold">{texts.back}</span>
          </button>

          {/* Summary */}
          <div className="bg-yellow-400/10 rounded-2xl p-4 mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-calendar-fill text-gray-900 text-lg"></i>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold">{texts.selectedDate}</span>
                <p className="text-gray-900 font-bold">{selectedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-time-fill text-pink-500 text-lg"></i>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold">{texts.selectedTime}</span>
                <p className="text-gray-900 font-bold">
                  {extractTime(selectedSlot.start_time)} – {extractTime(selectedSlot.end_time)}
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">Enter your email</h3>
          <p className="text-sm text-gray-500 mb-5">
            We&apos;ll send your booking confirmation to this address.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address <span className="text-pink-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                  emailError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                }`}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEmailContinue(); } }}
              />
              {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
            </div>

            <button
              onClick={handleEmailContinue}
              className="w-full py-3.5 bg-pink-500 text-white rounded-full font-bold text-sm hover:bg-pink-600 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Continue to Booking Form
              <i className="ri-arrow-right-line text-lg"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
