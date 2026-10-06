import React, { useState } from 'react';
import { Issue, NeighborhoodEvent, RoleType } from '@neighborly/shared';

interface IssueDetailModalProps {
  issue: Issue;
  events: NeighborhoodEvent[];
  isUpvoted: boolean;
  role: RoleType;
  onClose: () => void;
  onToggleUpvote: (id: string) => void;
  onOpenEvent: (eventId: string) => void;
  onOpenCoordination: (issueId: string) => void;
  onVolunteer: (issueId: string, plan: string, when: string, createEvent: boolean) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  events,
  isUpvoted,
  role,
  onClose,
  onToggleUpvote,
  onOpenEvent,
  onOpenCoordination,
  onVolunteer
}) => {
  const [volModalOpen, setVolModalOpen] = useState(false);
  const [volPlan, setVolPlan] = useState('');
  const [volWhen, setVolWhen] = useState('This Saturday');
  const [volEvent, setVolEvent] = useState(true);

  const isOrg = role === 'org';
  const orgName = 'Green Elm';
  const isOrgOnIt = issue.orgs.some(o => o.name === orgName);
  const linkedEvent = issue.event ? events.find(e => e.id === issue.event) : null;

  // Status Styling
  const getStatusBadge = () => {
    if (issue.status === 'fixed') {
      return { label: 'Fixed', bg: 'bg-softGreen', text: 'text-forest-dark' };
    }
    if (issue.status === 'progress') {
      return { label: 'In progress', bg: 'bg-softYellow', text: 'text-charcoal' };
    }
    return { label: 'Needs help', bg: 'bg-[#fde6dc]', text: 'text-coral-dark' };
  };

  const statusBadge = getStatusBadge();

  // Progress Steps calculation
  const currentStep = issue.status === 'fixed' ? 2 : issue.status === 'progress' ? 1 : 0;
  const steps = ['Posted', 'Orgs on it', 'Fixed'];

  const handleConfirmVolunteer = () => {
    onVolunteer(issue.id, volPlan, volWhen, volEvent);
    setVolModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-surface text-charcoal p-5 sm:p-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-charcoal/10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-nunito font-extrabold bg-cream border-2 border-charcoal">
            {issue.cat}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-nunito font-black border-2 border-charcoal ${statusBadge.bg} ${statusBadge.text}`}>
            {statusBadge.label}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full border-2 border-charcoal bg-cream hover:bg-yellow-100 flex items-center justify-center font-bold text-sm shadow-hard-sm"
        >
          ✕
        </button>
      </div>

      {/* Title & Upvote */}
      <div className="flex items-start justify-between gap-4 mt-4">
        <h2 className="font-fredoka font-bold text-xl sm:text-2xl leading-snug">
          {issue.title}
        </h2>

        <button
          onClick={() => onToggleUpvote(issue.id)}
          className={`flex-none flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-charcoal font-nunito font-black text-sm shadow-hard transition-all active:translate-x-0.5 active:translate-y-0.5 ${
            isUpvoted ? 'bg-coral text-charcoal' : 'bg-cream text-charcoal hover:bg-white'
          }`}
        >
          <span>▲</span>
          <span>{issue.votes}</span>
          <span className="text-xs font-bold opacity-80">{isUpvoted ? 'Upvoted' : 'Me too'}</span>
        </button>
      </div>

      {/* Reporter Meta */}
      <div className="text-xs font-nunito font-semibold text-charcoal/70 mt-1">
        Reported by {issue.by} · {issue.ago}
      </div>

      {/* Description */}
      <p className="text-sm font-nunito leading-relaxed mt-3 text-charcoal/90 bg-cream/70 p-3.5 rounded-xl border-2 border-charcoal/15">
        {issue.desc}
      </p>

      {/* 3-Step Progress Track */}
      <div className="mt-5 p-3.5 bg-cream border-2 border-charcoal rounded-2xl shadow-hard-sm">
        <div className="text-xs font-nunito font-extrabold uppercase tracking-wider text-charcoal/60 mb-2">
          Progress Timeline
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {steps.map((label, idx) => {
            const isDone = idx <= currentStep;
            return (
              <div
                key={label}
                className={`py-1.5 px-2 rounded-xl text-xs font-nunito font-black border-2 border-charcoal transition-colors ${
                  isDone
                    ? idx === 2
                      ? 'bg-forest text-white'
                      : 'bg-coral text-charcoal'
                    : 'bg-surface text-charcoal/40'
                }`}
              >
                {label} {isDone ? '✓' : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* Organizations Involved */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-nunito font-extrabold uppercase tracking-wider text-charcoal/60">
            Organizations Involved
          </span>
          <span className="text-xs font-nunito font-bold text-charcoal/70">
            {issue.orgs.length ? `${issue.orgs.length} org${issue.orgs.length > 1 ? 's' : ''}` : 'None yet'}
          </span>
        </div>

        {issue.orgs.length > 0 ? (
          <div className="flex flex-col gap-2">
            {issue.orgs.map(org => (
              <div
                key={org.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface border-2 border-charcoal shadow-hard-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-forest text-white border-2 border-charcoal flex items-center justify-center font-nunito font-black text-xs">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-nunito font-black text-sm">{org.name}</div>
                    <div className="text-xs text-charcoal/70">{org.role}</div>
                  </div>
                </div>
                {org.lead && (
                  <span className="text-[10px] font-nunito font-black px-2 py-0.5 rounded-full bg-softGreen border border-charcoal">
                    Lead
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-cream/70 rounded-xl border-2 border-dashed border-charcoal/20 text-xs font-nunito text-charcoal/70">
            {issue.notified
              ? `${issue.notified} got a heads-up. No org has volunteered yet — upvotes show it matters.`
              : 'No organization has volunteered yet. Upvotes help local groups see what matters most.'}
          </div>
        )}
      </div>

      {/* Linked Community Event (Fix-it day) */}
      {linkedEvent && (
        <div className="mt-5 p-3.5 bg-softPurple border-2 border-charcoal rounded-2xl shadow-hard">
          <div className="text-xs font-nunito font-black text-civicPurple uppercase tracking-wider mb-1">
            Community Action Day
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-nunito font-black text-sm">{linkedEvent.title}</div>
              <div className="text-xs text-charcoal/70 mt-0.5">{linkedEvent.time} · {linkedEvent.place}</div>
            </div>
            <button
              onClick={() => onOpenEvent(linkedEvent.id)}
              className="px-3 py-1.5 rounded-xl bg-surface hover:bg-cream border-2 border-charcoal font-nunito font-black text-xs shadow-hard-sm"
            >
              RSVP →
            </button>
          </div>
        </div>
      )}

      {/* Public Updates Timeline */}
      <div className="mt-5">
        <div className="text-xs font-nunito font-extrabold uppercase tracking-wider text-charcoal/60 mb-2">
          Public Updates for Neighbors
        </div>
        <div className="flex flex-col gap-2.5">
          {issue.updates.map((upd, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-cream border-2 border-charcoal/20 text-xs font-nunito">
              <div className="flex items-center justify-between font-black text-charcoal mb-1">
                <span>{upd.who}</span>
                <span className="text-[11px] font-normal text-charcoal/60">{upd.when}</span>
              </div>
              <p className="text-charcoal/80 leading-relaxed">{upd.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Organization Action Section */}
      {isOrg && issue.status !== 'fixed' && (
        <div className="mt-6 pt-4 border-t-2 border-charcoal/15">
          {isOrgOnIt ? (
            <button
              onClick={() => onOpenCoordination(issue.id)}
              className="w-full py-3 rounded-xl bg-softGreen hover:bg-green-300 border-2 border-charcoal font-nunito font-black text-sm shadow-hard transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>◆</span> Open Coordination Hub (Tasks & Chat) →
            </button>
          ) : (
            <button
              onClick={() => setVolModalOpen(true)}
              className="w-full py-3 rounded-xl bg-forest hover:bg-forest-light text-white border-2 border-charcoal font-nunito font-black text-sm shadow-hard transition-transform active:scale-[0.98]"
            >
              Volunteer Green Elm on this Issue
            </button>
          )}
        </div>
      )}

      {/* Volunteer Modal Form */}
      {volModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border-2 border-charcoal shadow-hard-lg rounded-2xl w-full max-w-md p-5 animate-in fade-in zoom-in-95">
            <h3 className="font-fredoka font-bold text-xl mb-1">Volunteer on this Issue</h3>
            <p className="text-xs font-nunito text-charcoal/70 mb-4">
              Neighbors will see Green Elm is working on this.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-nunito font-extrabold uppercase mb-1">
                  What is your plan?
                </label>
                <input
                  type="text"
                  value={volPlan}
                  onChange={e => setVolPlan(e.target.value)}
                  placeholder="e.g., Crew will repair streetlight fixture"
                  className="w-full px-3 py-2 rounded-xl bg-cream border-2 border-charcoal font-nunito text-sm outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-nunito font-extrabold uppercase mb-1">
                  Timeline
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['This Saturday', 'Next week', 'This month'].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setVolWhen(w)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-nunito font-black border-2 border-charcoal transition-colors ${
                        volWhen === w ? 'bg-charcoal text-white' : 'bg-cream text-charcoal'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={volEvent}
                  onChange={e => setVolEvent(e.target.checked)}
                  className="w-4 h-4 rounded text-forest"
                />
                <span className="text-xs font-nunito font-bold">
                  Create a public fix-it day on the neighborhood calendar
                </span>
              </label>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setVolModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-charcoal bg-cream font-nunito font-black text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVolunteer}
                  className="flex-1 py-2.5 rounded-xl border-2 border-charcoal bg-forest text-white font-nunito font-black text-sm shadow-hard"
                >
                  Confirm & Commit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
