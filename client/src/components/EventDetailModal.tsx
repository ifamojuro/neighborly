import React, { useState } from 'react';
import { NeighborhoodEvent, RsvpRecord, RsvpStatus } from '@neighborly/shared';

const WDL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface EventDetailModalProps {
  event: NeighborhoodEvent;
  rsvpRecord: RsvpRecord | null;
  onClose: () => void;
  onSubmitRsvp: (status: RsvpStatus, group: number, remind: boolean) => void;
  onOpenLinkedIssue?: (issueId: string) => void;
  onShowOnMap: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  rsvpRecord,
  onClose,
  onSubmitRsvp,
  onOpenLinkedIssue,
  onShowOnMap
}) => {
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<RsvpStatus>(rsvpRecord?.status || 'going');
  const [groupSize, setGroupSize] = useState<number>(rsvpRecord?.group || 1);
  const [remind, setRemind] = useState<boolean>(rsvpRecord?.remind !== false);

  const isGoing = rsvpRecord?.status === 'going';
  const attendeeCount = event.going + (isGoing ? rsvpRecord.group : 0);

  const handleConfirmRsvp = () => {
    onSubmitRsvp(selectedStatus, groupSize, remind);
    setRsvpOpen(false);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-surface text-charcoal p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-charcoal/10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-nunito font-extrabold bg-cobalt text-white border-2 border-charcoal">
            {event.cat}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-nunito font-extrabold bg-cream border-2 border-charcoal">
            {attendeeCount} going
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full border-2 border-charcoal bg-cream hover:bg-yellow-100 flex items-center justify-center font-bold text-sm shadow-hard-sm"
        >
          ✕
        </button>
      </div>

      {/* Title */}
      <h2 className="font-fredoka font-bold text-2xl mt-4 leading-snug">
        {event.title}
      </h2>

      {/* Host Org */}
      <div className="flex items-center gap-2 mt-2">
        <div className="w-6 h-6 rounded-md bg-forest text-white font-nunito font-bold text-[10px] flex items-center justify-center border border-charcoal">
          {event.org.slice(0, 2).toUpperCase()}
        </div>
        <span className="text-xs font-nunito font-extrabold text-charcoal/80">
          Hosted by {event.org}
        </span>
      </div>

      {/* Date & Location Card */}
      <div className="mt-4 p-3.5 bg-cream rounded-2xl border-2 border-charcoal space-y-2 text-xs font-nunito">
        <div className="flex items-center gap-2.5">
          <span className="text-base">📅</span>
          <div>
            <span className="font-black">
              {WDL[(event.day - 1) % 7]}, March {event.day}
            </span>
            <span className="text-charcoal/70"> · {event.time}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-base">📍</span>
          <span className="font-bold">{event.place}</span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 text-sm font-nunito leading-relaxed text-charcoal/90">
        {event.desc}
      </p>

      {/* Linked Issue Banner */}
      {event.issue && onOpenLinkedIssue && (
        <div className="mt-4 p-3.5 bg-softPurple border-2 border-charcoal rounded-2xl shadow-hard-sm">
          <div className="text-[11px] font-nunito font-black text-civicPurple uppercase tracking-wider mb-1">
            Linked Neighborhood Issue
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-nunito font-bold text-charcoal">
              Fix-it day organized for this report
            </span>
            <button
              onClick={() => onOpenLinkedIssue(event.issue!)}
              className="px-2.5 py-1 rounded-xl bg-surface hover:bg-cream border border-charcoal font-nunito font-black text-xs shadow-hard-sm"
            >
              View Issue →
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons: RSVP & Show on Map */}
      <div className="mt-6 space-y-2.5">
        <button
          onClick={() => setRsvpOpen(true)}
          className={`w-full py-3.5 rounded-2xl font-nunito font-black text-sm border-2 border-charcoal shadow-hard transition-transform active:scale-[0.98] ${
            isGoing
              ? 'bg-softGreen text-forest-dark'
              : 'bg-forest hover:bg-forest-light text-white'
          }`}
        >
          {isGoing ? "You're Going ✓ · Change RSVP" : 'RSVP to this Event'}
        </button>

        <button
          onClick={onShowOnMap}
          className="w-full py-2.5 rounded-2xl bg-cream hover:bg-white text-charcoal font-nunito font-extrabold text-xs border-2 border-charcoal shadow-hard-sm"
        >
          Show Pin on Map ◉
        </button>
      </div>

      {/* RSVP Drawer Sheet */}
      {rsvpOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-surface border-t-2 sm:border-2 border-charcoal shadow-hard-lg rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 sm:p-6 animate-in slide-in-from-bottom-6 sm:zoom-in-95">
            <h3 className="font-fredoka font-bold text-xl mb-1">RSVP to {event.title}</h3>
            <p className="text-xs font-nunito text-charcoal/70 mb-4">
              Help the host plan supplies and volunteer assignments.
            </p>

            {/* Status Options */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { key: 'going', label: 'Going' },
                { key: 'maybe', label: 'Maybe' },
                { key: 'cant', label: "Can't go" }
              ].map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedStatus(opt.key as RsvpStatus)}
                  className={`py-2 px-2 rounded-xl text-xs font-nunito font-black border-2 border-charcoal transition-all ${
                    selectedStatus === opt.key
                      ? 'bg-forest text-white shadow-hard-sm'
                      : 'bg-cream text-charcoal hover:bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Group Size (if going or maybe) */}
            {selectedStatus !== 'cant' && (
              <div className="p-3 bg-cream rounded-xl border-2 border-charcoal mb-4 flex items-center justify-between">
                <div>
                  <div className="font-nunito font-extrabold text-xs">How many people?</div>
                  <div className="text-[10px] text-charcoal/60">Including yourself</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                    className="w-7 h-7 rounded-lg bg-surface border border-charcoal font-black text-sm flex items-center justify-center active:scale-95"
                  >
                    -
                  </button>
                  <span className="font-fredoka font-bold text-base w-4 text-center">
                    {groupSize}
                  </span>
                  <button
                    onClick={() => setGroupSize(Math.min(9, groupSize + 1))}
                    className="w-7 h-7 rounded-lg bg-surface border border-charcoal font-black text-sm flex items-center justify-center active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Reminder Toggle */}
            <label className="flex items-center gap-2 cursor-pointer mb-5 select-none">
              <input
                type="checkbox"
                checked={remind}
                onChange={e => setRemind(e.target.checked)}
                className="w-4 h-4 rounded text-forest"
              />
              <span className="text-xs font-nunito font-bold text-charcoal/80">
                Remind me the day before
              </span>
            </label>

            {/* Actions */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setRsvpOpen(false)}
                className="flex-1 py-3 rounded-xl border-2 border-charcoal bg-cream font-nunito font-black text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRsvp}
                className="flex-1 py-3 rounded-xl border-2 border-charcoal bg-forest text-white font-nunito font-black text-xs shadow-hard"
              >
                Confirm RSVP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
