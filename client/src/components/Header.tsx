import React from 'react';
import { UserPersona, RoleType } from '@neighborly/shared';

interface HeaderProps {
  persona: UserPersona;
  onSwitchPersona: (role: RoleType) => void;
  activeTab: 'map' | 'calendar' | 'org' | 'me';
  onSelectTab: (tab: 'map' | 'calendar' | 'org' | 'me') => void;
  onOpenReport: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  persona,
  onSwitchPersona,
  activeTab,
  onSelectTab,
  onOpenReport,
  onOpenProfile
}) => {
  const isResident = persona.role === 'resident';

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-surface border-b-2 border-charcoal flex-none relative z-30">
      {/* Brand & Neighborhood Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSelectTab('map')}>
          <div className="w-9 h-9 rounded-xl bg-forest border-2 border-charcoal shadow-hard flex items-center justify-center text-white font-fredoka font-bold text-xl -rotate-6">
            n
          </div>
          <span className="font-fredoka font-bold text-2xl tracking-tight hidden sm:inline text-charcoal">
            Neighborly
          </span>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-charcoal rounded-full bg-softYellow font-nunito font-extrabold text-xs sm:text-sm text-charcoal hover:bg-yellow-200 transition-colors">
          Elm Park <span className="text-[10px]">▼</span>
        </button>
      </div>

      {/* Desktop Main Navigation */}
      <div className="hidden md:flex items-center gap-1 p-1 bg-cream border-2 border-charcoal rounded-full">
        <button
          onClick={() => onSelectTab('map')}
          className={`px-4 py-1.5 rounded-full font-nunito font-extrabold text-sm transition-all ${
            activeTab === 'map'
              ? 'bg-charcoal text-white shadow-sm'
              : 'text-charcoal hover:bg-white/60'
          }`}
        >
          {isResident ? 'Map' : 'Issues Map'}
        </button>
        <button
          onClick={() => onSelectTab('calendar')}
          className={`px-4 py-1.5 rounded-full font-nunito font-extrabold text-sm transition-all ${
            activeTab === 'calendar'
              ? 'bg-charcoal text-white shadow-sm'
              : 'text-charcoal hover:bg-white/60'
          }`}
        >
          Calendar
        </button>
        {!isResident && (
          <button
            onClick={() => onSelectTab('org')}
            className={`px-4 py-1.5 rounded-full font-nunito font-extrabold text-sm transition-all ${
              activeTab === 'org'
                ? 'bg-charcoal text-white shadow-sm'
                : 'text-charcoal hover:bg-white/60'
            }`}
          >
            Org Workspace
          </button>
        )}
      </div>

      {/* Right Controls: Persona Switcher & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Persona Switcher Pill */}
        <div className="flex items-center bg-cream border-2 border-charcoal rounded-full p-0.5">
          <button
            onClick={() => onSwitchPersona('resident')}
            className={`px-2.5 sm:px-3 py-1 rounded-full font-nunito font-bold text-xs transition-colors ${
              isResident
                ? 'bg-forest text-white shadow-hard-sm'
                : 'text-charcoal hover:bg-surface'
            }`}
            title="Switch to Resident Persona"
          >
            <span className="hidden sm:inline">Dana · </span>Resident
          </button>
          <button
            onClick={() => onSwitchPersona('org')}
            className={`px-2.5 sm:px-3 py-1 rounded-full font-nunito font-bold text-xs transition-colors ${
              !isResident
                ? 'bg-forest text-white shadow-hard-sm'
                : 'text-charcoal hover:bg-surface'
            }`}
            title="Switch to Organization Persona"
          >
            <span className="hidden sm:inline">Green Elm · </span>Org
          </button>
        </div>

        {/* Report FAB for Desktop */}
        {isResident && (
          <button
            onClick={onOpenReport}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-coral hover:bg-coral-dark text-charcoal font-nunito font-black text-sm border-2 border-charcoal shadow-hard transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>+</span> Report
          </button>
        )}

        {/* Avatar Profile Trigger */}
        <button
          onClick={onOpenProfile}
          className={`w-9 h-9 rounded-full border-2 border-charcoal shadow-hard flex items-center justify-center font-nunito font-black text-xs text-white transition-transform active:scale-95 ${
            isResident ? 'bg-civicPurple' : 'bg-forest'
          }`}
          title="Open Profile"
        >
          {isResident ? 'DR' : 'GE'}
        </button>
      </div>
    </header>
  );
};
