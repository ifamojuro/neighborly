import React, { useState } from 'react';
import { Issue } from '@neighborly/shared';

interface OrgWorkspaceProps {
  issues: Issue[];
  onOpenIssue: (id: string) => void;
  onOpenCoordination: (id: string) => void;
}

export const OrgWorkspace: React.FC<OrgWorkspaceProps> = ({
  issues,
  onOpenIssue,
  onOpenCoordination
}) => {
  const [activeTab, setActiveTab] = useState<'open' | 'fit' | 'fixing'>('fit');
  const orgName = 'Green Elm';

  const mine = (i: Issue) => i.orgs.some(o => o.name === orgName);

  // Filter issues by tab
  const getFilteredIssues = () => {
    if (activeTab === 'fixing') {
      return issues.filter(mine);
    }
    if (activeTab === 'fit') {
      return issues.filter(i => !!i.fit && !mine(i) && i.status !== 'fixed');
    }
    return issues.filter(i => !mine(i) && i.status !== 'fixed');
  };

  const filteredIssues = getFilteredIssues();

  const hints = {
    open: 'Issues residents posted that still need help. Volunteer on anything you can take on.',
    fit: 'AI matched these to what Green Elm does and where you work.',
    fixing: 'Issues Green Elm has volunteered on. Open one to coordinate with other orgs.'
  };

  return (
    <div className="flex flex-col h-full bg-surface text-charcoal p-5 sm:p-6 overflow-y-auto">
      {/* Workspace Header */}
      <div className="pb-3 border-b-2 border-charcoal/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-forest text-white font-fredoka font-bold flex items-center justify-center border-2 border-charcoal">
            GE
          </div>
          <div>
            <h2 className="font-fredoka font-bold text-xl leading-none">Green Elm Workspace</h2>
            <p className="text-xs font-nunito text-charcoal/70 mt-0.5">Verified Organization · Elm Park</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 grid grid-cols-3 gap-1.5 p-1 bg-cream border-2 border-charcoal rounded-2xl">
        {[
          { key: 'open', label: 'Needs help' },
          { key: 'fit', label: '✦ Good fit' },
          { key: 'fixing', label: "We're fixing" }
        ].map(tab => {
          const isSelected = activeTab === tab.key;
          const count =
            tab.key === 'fixing'
              ? issues.filter(mine).length
              : tab.key === 'fit'
              ? issues.filter(i => !!i.fit && !mine(i) && i.status !== 'fixed').length
              : issues.filter(i => !mine(i) && i.status !== 'fixed').length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 rounded-xl text-xs font-nunito font-black transition-all flex items-center justify-center gap-1 ${
                isSelected
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'text-charcoal hover:bg-white/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-white/20' : 'bg-charcoal/10'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Context Hint */}
      <p className="mt-3 text-xs font-nunito text-charcoal/70 bg-cream/70 p-3 rounded-xl border border-charcoal/10">
        {hints[activeTab]}
      </p>

      {/* Issue Feed */}
      <div className="mt-4 space-y-3">
        {filteredIssues.length > 0 ? (
          filteredIssues.map(issue => {
            const isVolunteered = mine(issue);

            return (
              <div
                key={issue.id}
                className="p-4 rounded-2xl bg-cream border-2 border-charcoal shadow-hard hover:bg-white transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-nunito font-extrabold bg-surface border border-charcoal">
                      {issue.cat}
                    </span>
                    <span className="text-xs font-nunito font-bold text-charcoal/60">
                      ▲ {issue.votes} votes
                    </span>
                  </div>

                  <button
                    onClick={() => (isVolunteered ? onOpenCoordination(issue.id) : onOpenIssue(issue.id))}
                    className={`px-3 py-1 rounded-xl font-nunito font-black text-xs border-2 border-charcoal shadow-hard-sm transition-transform active:scale-95 ${
                      isVolunteered
                        ? 'bg-softGreen text-forest-dark hover:bg-green-200'
                        : 'bg-coral text-charcoal hover:bg-coral-dark'
                    }`}
                  >
                    {isVolunteered ? 'Coordinate →' : 'Volunteer'}
                  </button>
                </div>

                <h4
                  onClick={() => onOpenIssue(issue.id)}
                  className="font-fredoka font-bold text-lg text-charcoal cursor-pointer hover:underline"
                >
                  {issue.title}
                </h4>

                <p className="text-xs font-nunito text-charcoal/80 mt-1 line-clamp-2">
                  {issue.desc}
                </p>

                {/* Subtext info */}
                {activeTab === 'fit' && issue.fit && (
                  <div className="mt-2.5 pt-2 border-t border-charcoal/10 text-xs font-nunito font-bold text-civicPurple flex items-center gap-1">
                    <span>✦ Matched:</span> {issue.fit}
                  </div>
                )}

                {isVolunteered && (
                  <div className="mt-2.5 pt-2 border-t border-charcoal/10 flex items-center justify-between text-xs font-nunito text-charcoal/70">
                    <span>👥 {issue.orgs.length} org{issue.orgs.length > 1 ? 's' : ''} assigned</span>
                    <span>✓ {issue.tasks.filter(t => t.done).length} of {issue.tasks.length} tasks done</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-cream/40 rounded-2xl border-2 border-dashed border-charcoal/20">
            <p className="text-sm font-nunito text-charcoal/60">
              No issues in this section right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
