import React, { useState } from 'react';
import {
  IssueCategory,
  DuplicateIssueMatch,
  LatLng,
  CATEGORY_ORG_SUGGESTIONS
} from '@neighborly/shared';

interface ReportWizardModalProps {
  step: number;
  draftPin: LatLng | null;
  duplicates: DuplicateIssueMatch[];
  onClose: () => void;
  onUseLocation: () => void;
  onConfirmLocation: () => void;
  onUpvoteDuplicate: (id: string) => void;
  onProceedToDetails: () => void;
  onBack: () => void;
  onSubmit: (data: {
    title: string;
    cat: IssueCategory;
    desc: string;
    photo: boolean;
    anon: boolean;
    notifiedOrg: string | null;
  }) => void;
}

const CATEGORIES: IssueCategory[] = ['Lighting', 'Roads', 'Trash', 'Safety', 'Parks', 'Other'];

export const ReportWizardModal: React.FC<ReportWizardModalProps> = ({
  step,
  draftPin: _draftPin,
  duplicates,
  onClose,
  onUseLocation,
  onConfirmLocation,
  onUpvoteDuplicate,
  onProceedToDetails,
  onBack,
  onSubmit
}) => {
  const [selectedCat, setSelectedCat] = useState<IssueCategory | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isAnon, setIsAnon] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  const suggestions = selectedCat ? CATEGORY_ORG_SUGGESTIONS[selectedCat] || [] : [];
  const primaryOrg = selectedOrg || (suggestions[0] ? suggestions[0].name : null);

  const handleSubmit = (notify: boolean) => {
    if (!selectedCat) return;
    onSubmit({
      title: title.trim(),
      cat: selectedCat,
      desc: desc.trim(),
      photo: hasPhoto,
      anon: isAnon,
      notifiedOrg: notify ? primaryOrg : null
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-surface border-t-2 sm:border-2 border-charcoal shadow-hard-lg rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:zoom-in-95">
        {/* Progress & Step Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-charcoal/10">
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={onBack}
                className="w-7 h-7 rounded-lg bg-cream border border-charcoal flex items-center justify-center font-bold text-xs"
              >
                ←
              </button>
            )}
            <span className="font-nunito font-extrabold text-xs uppercase tracking-wider text-charcoal/60">
              {step === 0 ? 'Start Report' : `Step ${step} of 4`}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-charcoal bg-cream hover:bg-yellow-100 flex items-center justify-center font-bold text-sm shadow-hard-sm"
          >
            ✕
          </button>
        </div>

        {/* STEP 0: Introduction & Geolocation Trigger */}
        {step === 0 && (
          <div className="mt-4 text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-forest text-white border-2 border-charcoal shadow-hard mx-auto flex items-center justify-center font-fredoka font-bold text-3xl mb-4 -rotate-3">
              📍
            </div>
            <h3 className="font-fredoka font-bold text-2xl text-charcoal mb-2">
              Report an Issue
            </h3>
            <p className="text-sm font-nunito text-charcoal/70 max-w-xs mx-auto mb-6 leading-relaxed">
              Help your neighbors by reporting potholes, broken lights, trash, or safety concerns on your block.
            </p>

            <button
              onClick={onUseLocation}
              className="w-full py-3.5 px-4 rounded-2xl bg-forest hover:bg-forest-light text-white font-nunito font-black text-sm border-2 border-charcoal shadow-hard flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <span>🎯</span> Use My Location
            </button>
          </div>
        )}

        {/* STEP 1: Pinpoint Location on Map */}
        {step === 1 && (
          <div className="mt-4">
            <h3 className="font-fredoka font-bold text-xl mb-1">Confirm the Spot</h3>
            <p className="text-xs font-nunito text-charcoal/70 mb-4">
              Drag the marker on the map behind this sheet if you need to adjust the exact location.
            </p>

            <div className="p-3.5 bg-cream rounded-2xl border-2 border-charcoal mb-5 flex items-center gap-3">
              <span className="text-xl">📌</span>
              <div>
                <div className="font-nunito font-black text-sm">Near 5th & Elm St</div>
                <div className="text-[11px] text-charcoal/60">Elm Park, Portland OR</div>
              </div>
            </div>

            <button
              onClick={onConfirmLocation}
              className="w-full py-3.5 rounded-2xl bg-coral hover:bg-coral-dark text-charcoal font-nunito font-black text-sm border-2 border-charcoal shadow-hard transition-transform active:scale-[0.98]"
            >
              Confirm Spot →
            </button>
          </div>
        )}

        {/* STEP 2: Duplicate Detection Check */}
        {step === 2 && (
          <div className="mt-4">
            <div className="inline-block px-2.5 py-1 rounded-full bg-softYellow border border-charcoal text-[11px] font-nunito font-black text-charcoal mb-2">
              ✦ Duplicate Detection
            </div>
            <h3 className="font-fredoka font-bold text-xl mb-1">
              Did someone already report this?
            </h3>
            <p className="text-xs font-nunito text-charcoal/70 mb-4">
              We found {duplicates.length} open issue{duplicates.length > 1 ? 's' : ''} nearby. Upvoting helps prioritize it without doubling up.
            </p>

            {/* Duplicate Candidates List */}
            <div className="space-y-2.5 mb-5 max-h-52 overflow-y-auto">
              {duplicates.map(dup => (
                <div
                  key={dup.id}
                  className="p-3 bg-cream rounded-2xl border-2 border-charcoal shadow-hard-sm flex items-center justify-between"
                >
                  <div>
                    <div className="font-nunito font-black text-sm">{dup.title}</div>
                    <div className="text-xs text-charcoal/60 mt-0.5">
                      {dup.cat} · {dup.distanceMeters}m away
                    </div>
                  </div>
                  <button
                    onClick={() => onUpvoteDuplicate(dup.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-coral border-2 border-charcoal font-nunito font-black text-xs shadow-hard-sm"
                  >
                    <span>▲</span> Upvote ({dup.votes})
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={onProceedToDetails}
              className="w-full py-3 rounded-2xl bg-surface hover:bg-cream border-2 border-charcoal font-nunito font-black text-sm shadow-hard-sm"
            >
              No, this is a different issue →
            </button>
          </div>
        )}

        {/* STEP 3: Issue Details */}
        {step === 3 && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-nunito font-extrabold uppercase tracking-wider text-charcoal/70 mb-2">
                1. Pick Category *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCat(cat)}
                    className={`py-2 px-2 rounded-xl text-xs font-nunito font-extrabold border-2 border-charcoal transition-all ${
                      selectedCat === cat
                        ? 'bg-coral text-charcoal shadow-hard-sm font-black'
                        : 'bg-cream text-charcoal/80 hover:bg-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-nunito font-extrabold uppercase tracking-wider text-charcoal/70 mb-1.5">
                2. Summary Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Streetlight fixture flickering at night"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream border-2 border-charcoal font-nunito text-sm outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-nunito font-extrabold uppercase tracking-wider text-charcoal/70 mb-1.5">
                3. Helpful Details (Optional)
              </label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={2}
                placeholder="Where on the street is it? What time does it happen?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream border-2 border-charcoal font-nunito text-xs outline-none focus:bg-white resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setHasPhoto(!hasPhoto)}
                className={`px-3 py-1.5 rounded-xl border-2 border-charcoal font-nunito font-black text-xs shadow-hard-sm transition-colors ${
                  hasPhoto ? 'bg-softGreen text-forest-dark' : 'bg-cream text-charcoal'
                }`}
              >
                {hasPhoto ? '📷 Photo Added ✓' : '+ Add Photo'}
              </button>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnon}
                  onChange={e => setIsAnon(e.target.checked)}
                  className="w-4 h-4 rounded text-forest"
                />
                <span className="text-xs font-nunito font-bold text-charcoal/80">
                  Post anonymously
                </span>
              </label>
            </div>

            <button
              onClick={() => {
                if (!selectedCat) return;
                onProceedToDetails();
              }}
              disabled={!selectedCat}
              className={`w-full py-3.5 rounded-2xl font-nunito font-black text-sm border-2 border-charcoal transition-all shadow-hard ${
                selectedCat
                  ? 'bg-forest text-white active:scale-[0.98]'
                  : 'bg-charcoal/20 text-charcoal/40 border-charcoal/30 cursor-not-allowed shadow-none'
              }`}
            >
              Next: Match Organizations →
            </button>
          </div>
        )}

        {/* STEP 4: Smart Org Matching & Submission */}
        {step === 4 && (
          <div className="mt-4">
            <div className="inline-block px-2.5 py-1 rounded-full bg-softPurple border border-charcoal text-[11px] font-nunito font-black text-civicPurple mb-2">
              ✦ Smart Organization Matching
            </div>
            <h3 className="font-fredoka font-bold text-xl mb-1">
              Matched Local Organizations
            </h3>
            <p className="text-xs font-nunito text-charcoal/70 mb-4 leading-relaxed">
              Based on similar {selectedCat?.toLowerCase()} issues near Elm Park, these groups have relevant focus. They will receive an alert to volunteer.
            </p>

            <div className="space-y-2.5 mb-5">
              {suggestions.map((sug, idx) => {
                const isSelected = (selectedOrg || suggestions[0].name) === sug.name;
                return (
                  <div
                    key={sug.name}
                    onClick={() => setSelectedOrg(sug.name)}
                    className={`p-3.5 rounded-2xl border-2 border-charcoal cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-softPurple shadow-hard-sm'
                        : 'bg-surface hover:bg-cream'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-nunito font-black text-sm">{sug.name}</span>
                        {idx === 0 && (
                          <span className="text-[10px] font-nunito font-black px-1.5 py-0.5 rounded bg-forest text-white">
                            Top Match
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 border-charcoal flex items-center justify-center ${
                          isSelected ? 'bg-civicPurple' : 'bg-transparent'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="text-xs font-nunito text-charcoal/70">{sug.reason}</div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleSubmit(true)}
                className="w-full py-3.5 rounded-2xl bg-coral hover:bg-coral-dark text-charcoal font-nunito font-black text-sm border-2 border-charcoal shadow-hard transition-transform active:scale-[0.98]"
              >
                Post & Notify {primaryOrg || 'Organization'} →
              </button>
              <button
                onClick={() => handleSubmit(false)}
                className="w-full py-2.5 rounded-2xl bg-surface hover:bg-cream text-charcoal font-nunito font-bold text-xs border-2 border-charcoal"
              >
                Post to map without notifying
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
