import React, { useState } from 'react';
import { NeighborhoodEvent, RsvpRecord } from '@neighborly/shared';

const WDL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarViewProps {
  events: NeighborhoodEvent[];
  rsvps: Record<string, RsvpRecord>;
  onSelectEvent: (eventId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  rsvps,
  onSelectEvent
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(14);
  const [filterMode, setFilterMode] = useState<'all' | 'going'>('all');

  // Days with events
  const daysWithEvents = Array.from(new Set(events.map(e => e.day))).sort((a, b) => a - b);

  // Filter events by day and RSVP filter
  const filteredEvents = events.filter(e => {
    if (filterMode === 'going') {
      const userRsvp = rsvps[e.id];
      if (!userRsvp || userRsvp.status !== 'going') return false;
    }
    return e.day === selectedDay;
  });

  return (
    <div className="flex flex-col h-full bg-surface text-charcoal p-5 sm:p-6 overflow-y-auto">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-charcoal/10">
        <div>
          <h2 className="font-fredoka font-bold text-2xl">Neighborhood Calendar</h2>
          <p className="text-xs font-nunito text-charcoal/70">March 2026 · Elm Park</p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center bg-cream border-2 border-charcoal rounded-full p-0.5">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-full text-xs font-nunito font-extrabold transition-colors ${
              filterMode === 'all' ? 'bg-charcoal text-white' : 'text-charcoal hover:bg-surface'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterMode('going')}
            className={`px-3 py-1 rounded-full text-xs font-nunito font-extrabold transition-colors ${
              filterMode === 'going' ? 'bg-charcoal text-white' : 'text-charcoal hover:bg-surface'
            }`}
          >
            My RSVPs
          </button>
        </div>
      </div>

      {/* Date Carousel Selector */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {daysWithEvents.map(day => {
          const isSelected = day === selectedDay;
          const weekday = WD[(day - 1) % 7];
          const count = events.filter(e => e.day === day).length;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-none flex flex-col items-center py-2.5 px-3.5 rounded-2xl border-2 border-charcoal transition-all ${
                isSelected
                  ? 'bg-cobalt text-white shadow-hard font-black scale-105'
                  : 'bg-cream text-charcoal hover:bg-surface shadow-hard-sm'
              }`}
            >
              <span className="text-[10px] font-nunito uppercase">{weekday}</span>
              <span className="font-fredoka font-bold text-lg leading-none my-0.5">{day}</span>
              <span className={`text-[9px] font-nunito px-1 rounded-full ${isSelected ? 'bg-white/20' : 'bg-charcoal/10'}`}>
                {count} ev
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Overview Banner */}
      <div className="mt-4 flex items-center justify-between">
        <h3 className="font-fredoka font-bold text-lg">
          {WDL[(selectedDay - 1) % 7]}, March {selectedDay}
        </h3>
        <span className="text-xs font-nunito font-bold text-charcoal/70">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Event List */}
      <div className="mt-3 space-y-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(ev => {
            const userRsvp = rsvps[ev.id];
            const isGoing = userRsvp && userRsvp.status === 'going';

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev.id)}
                className="p-4 rounded-2xl bg-cream border-2 border-charcoal shadow-hard hover:bg-white cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-nunito font-extrabold bg-surface border border-charcoal">
                    {ev.cat}
                  </span>
                  {isGoing && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-nunito font-black bg-softGreen text-forest-dark border border-charcoal">
                      You're going ✓
                    </span>
                  )}
                </div>

                <h4 className="font-fredoka font-bold text-lg text-charcoal">{ev.title}</h4>
                <div className="text-xs font-nunito font-extrabold text-forest mt-0.5">
                  Hosted by {ev.org}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs font-nunito text-charcoal/70 pt-2 border-t border-charcoal/10">
                  <span>⏰ {ev.time}</span>
                  <span>📍 {ev.place.split(',')[0]}</span>
                  <span>👥 {ev.going + (isGoing ? userRsvp.group : 0)} attending</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-cream/40 rounded-2xl border-2 border-dashed border-charcoal/20">
            <p className="text-sm font-nunito text-charcoal/60">
              No events match your filter for this day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
