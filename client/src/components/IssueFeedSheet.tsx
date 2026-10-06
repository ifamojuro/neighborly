import React from 'react';
import { Issue, NeighborhoodEvent } from '@neighborly/shared';

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface IssueFeedSheetProps {
  issues: Issue[];
  events: NeighborhoodEvent[];
  layer: 'both' | 'issues' | 'events';
  onSelectLayer: (layer: 'both' | 'issues' | 'events') => void;
  onSelectIssue: (id: string) => void;
  onSelectEvent: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const IssueFeedSheet: React.FC<IssueFeedSheetProps> = ({
  issues,
  events,
  layer,
  onSelectLayer,
  onSelectIssue,
  onSelectEvent,
  isExpanded,
  onToggleExpand
}) => {
  // Sort issues by votes descending
  const sortedIssues = [...issues].sort((a, b) => b.votes - a.votes);
  // Upcoming events
  const upcomingEvents = events.filter(e => e.day >= 12);

  return (
    <div className="flex flex-col h-full bg-surface text-charcoal">
      {/* Mobile Drag Handle */}
      <div
        onClick={onToggleExpand}
        className="md:hidden py-2 flex items-center justify-center cursor-pointer select-none"
      >
        <div className="w-10 h-1.5 rounded-full bg-charcoal/20" />
      </div>

      {/* Header & Layer Filters */}
      <div className="px-5 pt-1 pb-3 border-b-2 border-charcoal/10 flex items-center justify-between gap-2">
        <div>
          <h2 className="font-fredoka font-bold text-xl leading-tight">Around Elm Park</h2>
          <p className="text-xs font-nunito text-charcoal/70">
            {issues.length} active issues · {upcomingEvents.length} events
          </p>
        </div>

        {/* Layer Pills */}
        <div className="flex items-center bg-cream border-2 border-charcoal rounded-full p-0.5">
          {[
            { key: 'both', label: 'All' },
            { key: 'issues', label: 'Issues' },
            { key: 'events', label: 'Events' }
          ].map(l => (
            <button
              key={l.key}
              onClick={() => onSelectLayer(l.key as any)}
              className={`px-2.5 py-1 rounded-full text-xs font-nunito font-extrabold transition-colors ${
                layer === l.key
                  ? 'bg-charcoal text-white'
                  : 'text-charcoal hover:bg-surface'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Feed */}
      <div className={`p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 ${isExpanded ? 'max-h-[75vh]' : 'max-h-72 md:max-h-none'}`}>
        {/* Events Section (if included in layer) */}
        {layer !== 'issues' && upcomingEvents.length > 0 && (
          <div className="space-y-2 mb-4">
            <div className="text-[11px] font-nunito font-extrabold uppercase tracking-wider text-charcoal/60">
              Upcoming Events
            </div>
            {upcomingEvents.slice(0, 3).map(ev => (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev.id)}
                className="p-3 bg-cream rounded-2xl border-2 border-charcoal shadow-hard-sm hover:bg-white cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cobalt text-white border-2 border-charcoal flex flex-col items-center justify-center font-nunito font-bold text-[10px]">
                    <span className="uppercase">{WD[(ev.day - 1) % 7]}</span>
                    <span className="font-fredoka text-sm leading-none">{ev.day}</span>
                  </div>
                  <div>
                    <div className="font-nunito font-black text-sm">{ev.title}</div>
                    <div className="text-xs text-charcoal/60">{ev.time} · {ev.org}</div>
                  </div>
                </div>
                <span className="text-xs font-nunito font-extrabold text-charcoal/70">
                  {ev.going} going
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Issues Section (if included in layer) */}
        {layer !== 'events' && (
          <div className="space-y-2.5">
            <div className="text-[11px] font-nunito font-extrabold uppercase tracking-wider text-charcoal/60">
              Community Issues
            </div>
            {sortedIssues.map(issue => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue.id)}
                className="p-3.5 bg-cream rounded-2xl border-2 border-charcoal shadow-hard hover:bg-white cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-nunito font-extrabold bg-surface border border-charcoal">
                      {issue.cat}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-nunito font-bold border border-charcoal ${
                        issue.status === 'fixed'
                          ? 'bg-softGreen text-forest-dark'
                          : issue.status === 'progress'
                          ? 'bg-softYellow text-charcoal'
                          : 'bg-[#fde6dc] text-coral-dark'
                      }`}
                    >
                      {issue.status === 'fixed' ? 'Fixed' : issue.status === 'progress' ? 'In progress' : 'Needs help'}
                    </span>
                  </div>

                  <span className="font-nunito font-black text-xs text-charcoal flex items-center gap-1 bg-surface px-2 py-0.5 rounded-full border border-charcoal">
                    ▲ {issue.votes}
                  </span>
                </div>

                <h4 className="font-fredoka font-bold text-base text-charcoal">
                  {issue.title}
                </h4>

                <div className="text-xs font-nunito text-charcoal/60 mt-1">
                  Reported by {issue.by} · {issue.ago}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
