import React from 'react';
import { UserPersona, Issue, NeighborhoodEvent, RsvpRecord } from '@neighborly/shared';

interface ProfileDrawerProps {
  persona: UserPersona;
  issues: Issue[];
  events: NeighborhoodEvent[];
  rsvps: Record<string, RsvpRecord>;
  onClose: () => void;
  onSelectIssue: (id: string) => void;
  onSelectEvent: (id: string) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  persona,
  issues,
  events,
  rsvps,
  onClose,
  onSelectIssue,
  onSelectEvent
}) => {
  const isResident = persona.role === 'resident';

  // Resident Data
  const myRsvps = events.filter(e => {
    const r = rsvps[e.id];
    return r && (r.status === 'going' || r.status === 'maybe');
  });
  const myReports = issues.filter(i => i.mine || i.by === 'Dana R.' || i.by === 'You');

  // Org Data
  const orgEvents = events.filter(e => e.org === 'Green Elm');
  const orgFixing = issues.filter(i => i.orgs.some(o => o.name === 'Green Elm'));

  return (
    <div className="flex flex-col h-full bg-surface text-charcoal p-5 sm:p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-charcoal/10">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl border-2 border-charcoal shadow-hard flex items-center justify-center font-fredoka font-bold text-lg text-white ${
              isResident ? 'bg-civicPurple' : 'bg-forest'
            }`}
          >
            {isResident ? 'DR' : 'GE'}
          </div>
          <div>
            <h2 className="font-fredoka font-bold text-xl">{persona.name}</h2>
            <p className="text-xs font-nunito text-charcoal/70">{persona.subtitle}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full border-2 border-charcoal bg-cream hover:bg-yellow-100 flex items-center justify-center font-bold text-sm shadow-hard-sm"
        >
          ✕
        </button>
      </div>

      {/* Section 1: RSVPs / Events */}
      <div className="mt-5">
        <h3 className="font-nunito font-extrabold text-xs uppercase tracking-wider text-charcoal/60 mb-2.5">
          {isResident ? 'Your RSVPs' : 'Hosted Events'}
        </h3>

        <div className="space-y-2">
          {(isResident ? myRsvps : orgEvents).length > 0 ? (
            (isResident ? myRsvps : orgEvents).map(ev => (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev.id)}
                className="p-3 bg-cream rounded-2xl border-2 border-charcoal shadow-hard-sm hover:bg-white cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-nunito font-black text-sm">{ev.title}</div>
                  <div className="text-xs text-charcoal/60">{ev.time} · {ev.place.split(',')[0]}</div>
                </div>
                <span className="text-xs font-nunito font-bold px-2 py-0.5 rounded-full bg-softGreen border border-charcoal">
                  Going ✓
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 bg-cream/40 rounded-xl border border-dashed border-charcoal/20 text-xs font-nunito text-charcoal/60 text-center">
              No RSVPs yet. Explore upcoming neighborhood events on the Calendar.
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Reports / Fixing */}
      <div className="mt-6">
        <h3 className="font-nunito font-extrabold text-xs uppercase tracking-wider text-charcoal/60 mb-2.5">
          {isResident ? 'Your Reported Issues' : "Issues You're Fixing"}
        </h3>

        <div className="space-y-2">
          {(isResident ? myReports : orgFixing).length > 0 ? (
            (isResident ? myReports : orgFixing).map(issue => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue.id)}
                className="p-3 bg-cream rounded-2xl border-2 border-charcoal shadow-hard-sm hover:bg-white cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-nunito font-black text-sm">{issue.title}</div>
                  <div className="text-xs text-charcoal/60">
                    {issue.cat} · ▲ {issue.votes} votes
                  </div>
                </div>
                <span
                  className={`text-[11px] font-nunito font-black px-2 py-0.5 rounded-full border border-charcoal ${
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
            ))
          ) : (
            <div className="p-4 bg-cream/40 rounded-xl border border-dashed border-charcoal/20 text-xs font-nunito text-charcoal/60 text-center">
              {isResident ? 'You have not reported any issues yet.' : 'No active issues assigned.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
