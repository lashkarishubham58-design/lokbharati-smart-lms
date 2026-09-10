import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  PartyPopper,
  Bookmark,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
  Info,
  Trash2
} from 'lucide-react';
import { AcademicEvent } from '../../types';
import { INITIAL_CALENDAR_EVENTS } from '../../data/mockDatabase';

export const AcademicCalendarModule: React.FC = () => {
  const [events, setEvents] = useState<AcademicEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [selectedSemCycle, setSelectedSemCycle] = useState<'odd' | 'even'>('odd');
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'matrix'>('matrix');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'exam' | 'holiday' | 'event' | 'deadline' | 'semester'>('exam');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-05');
  const [isImportant, setIsImportant] = useState(false);

  // Month ranges for Odd (June 2026 - Nov 2026) vs Even (Dec 2026 - June 2027)
  const oddMonths = [
    { key: '2026-06', label: 'June 2026' },
    { key: '2026-07', label: 'July 2026' },
    { key: '2026-08', label: 'August 2026' },
    { key: '2026-09', label: 'September 2026' },
    { key: '2026-10', label: 'October 2026' },
    { key: '2026-11', label: 'November 2026' },
  ];

  const evenMonths = [
    { key: '2026-12', label: 'December 2026' },
    { key: '2027-01', label: 'January 2027' },
    { key: '2027-02', label: 'February 2027' },
    { key: '2027-03', label: 'March 2027' },
    { key: '2027-04', label: 'April 2027' },
    { key: '2027-05', label: 'May 2027' },
    { key: '2027-06', label: 'June 2027' },
  ];

  const currentMonths = selectedSemCycle === 'odd' ? oddMonths : evenMonths;

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || e.type === filterType;

    // Filter by academic term cycle if not searching specifically
    const dateStr = e.startDate;
    const isOddDate = dateStr >= '2026-06-01' && dateStr <= '2026-11-30';
    const isEvenDate = dateStr >= '2026-12-01' && dateStr <= '2027-06-30';

    const matchesCycle = search ? true : selectedSemCycle === 'odd' ? isOddDate : isEvenDate;

    return matchesSearch && matchesType && matchesCycle;
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvt: AcademicEvent = {
      id: `evt_${Date.now()}`,
      title,
      description,
      type,
      startDate,
      endDate,
      isImportant,
    };
    setEvents([newEvt, ...events]);
    setAddModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((e) => e.id !== eventId));
  };

  const getEventBadgeColor = (type: string, isImportant?: boolean) => {
    if (isImportant || type === 'semester') {
      return 'bg-rose-500 text-white font-bold'; // Red - No Leave Day
    }
    switch (type) {
      case 'exam':
        return 'bg-purple-600 text-white font-bold'; // Purple - Exams
      case 'holiday':
        return 'bg-emerald-600 text-white font-bold'; // Green - Breaks
      case 'event':
      case 'deadline':
      default:
        return 'bg-rose-200 text-rose-900 font-bold'; // Pink - Important Events
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-2xl border border-slate-700/60 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Official University Academic Calendar
            </span>
            <span className="text-xs text-slate-300 font-medium">Session 2026–2027</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-400" />
            Lokbharti University Academic Calendar
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Official schedule covering Odd & Even Semesters, examination periods, internship launches, workshops, and holiday breaks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Academic Event
          </button>
        </div>
      </div>

      {/* Official Color Legend Bar matching user provided sheet */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Info className="w-4 h-4 text-emerald-500" />
          <span>Calendar Color Codes:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block shadow-sm"></span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">No Leave Day / Semester Kickoff</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="w-3.5 h-3.5 rounded bg-pink-300 dark:bg-pink-700 inline-block shadow-sm"></span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Important Events & Workshops</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="w-3.5 h-3.5 rounded bg-emerald-400 dark:bg-emerald-600 inline-block shadow-sm"></span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Breaks & Festive Holidays</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="w-3.5 h-3.5 rounded bg-purple-500 inline-block shadow-sm"></span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Exams (Mid-Term & Term End)</span>
          </div>
        </div>
      </div>

      {/* Term Toggle & Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Odd vs Even Semester Tab Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setSelectedSemCycle('odd')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-black transition-all ${
                selectedSemCycle === 'odd'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Odd Semester (Sem 1, 3 & 5)
            </button>
            <button
              onClick={() => setSelectedSemCycle('even')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-black transition-all ${
                selectedSemCycle === 'even'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Even Semester (Sem 2, 4 & 6)
            </button>
          </div>

          <div className="hidden sm:flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'matrix' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'card' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              List View
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schedule, exams, tours..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              id="calendar-search"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', 'exam', 'holiday', 'event', 'semester'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                  filterType === t
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MATRIX MONTH-BY-MONTH GRID VIEW */}
      {viewMode === 'matrix' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentMonths.map((m) => {
            const monthEvents = filteredEvents.filter((e) => e.startDate.startsWith(m.key));

            return (
              <div
                key={m.key}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col"
              >
                <div className="bg-slate-900 text-white px-4 py-3 font-black text-sm flex items-center justify-between">
                  <span>{m.label}</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-normal">
                    {monthEvents.length} Events
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1">
                  {monthEvents.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 italic">
                      No scheduled events matching filter
                    </div>
                  ) : (
                    monthEvents.map((evt) => {
                      const dayNum = evt.startDate.split('-')[2];
                      const badgeStyle = getEventBadgeColor(evt.type, evt.isImportant);

                      return (
                        <div
                          key={evt.id}
                          className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-start gap-3 bg-slate-50/50 dark:bg-slate-800/50"
                        >
                          <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 ${badgeStyle}`}>
                            <span className="text-sm font-black leading-none">{dayNum}</span>
                            <span className="text-[9px] uppercase font-bold tracking-tighter opacity-80">
                              {new Date(evt.startDate).toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {evt.title}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteEvent(evt.id)}
                                className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                                title="Delete Event"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {evt.description}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* CARD / LIST VIEW */
        <div className="space-y-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md ${
                evt.isImportant || evt.type === 'semester'
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${getEventBadgeColor(
                    evt.type,
                    evt.isImportant
                  )}`}
                >
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {evt.title}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono ${getEventBadgeColor(
                        evt.type,
                        evt.isImportant
                      )}`}
                    >
                      {evt.type}
                    </span>
                    {evt.isImportant && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded animate-pulse">
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{evt.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  {evt.startDate} {evt.endDate !== evt.startDate ? `to ${evt.endDate}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(evt.id)}
                  className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/50"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Event Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Academic Calendar Event</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Examination 2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details regarding syllabus, venue, or instructions..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="exam">Exam</option>
                    <option value="holiday">Holiday / Break</option>
                    <option value="event">Campus Event / Workshop</option>
                    <option value="semester">Semester Kickoff / No Leave Day</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={isImportant}
                      onChange={(e) => setIsImportant(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    High Priority Event
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

