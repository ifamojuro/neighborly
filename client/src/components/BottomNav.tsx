import React from 'react';
import { RoleType } from '@neighborly/shared';

interface BottomNavProps {
  role: RoleType;
  activeTab: 'map' | 'calendar' | 'org' | 'me';
  onSelectTab: (tab: 'map' | 'calendar' | 'org' | 'me') => void;
  onOpenReport: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  role,
  activeTab,
  onSelectTab,
  onOpenReport
}) => {
  const isResident = role === 'resident';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur border-t-2 border-charcoal px-4 py-2 flex items-center justify-around shadow-hard">
      {/* Map Tab */}
      <button
        onClick={() => onSelectTab('map')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'map' ? 'bg-forest text-white shadow-hard-sm' : 'text-charcoal'
        }`}
      >
        <span className="text-lg leading-none">◉</span>
        <span className="font-nunito font-bold text-xs">{isResident ? 'Map' : 'Issues'}</span>
      </button>

      {/* Calendar Tab */}
      <button
        onClick={() => onSelectTab('calendar')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'calendar' ? 'bg-forest text-white shadow-hard-sm' : 'text-charcoal'
        }`}
      >
        <span className="text-lg leading-none">▦</span>
        <span className="font-nunito font-bold text-xs">Calendar</span>
      </button>

      {/* Center FAB for Resident (Report) or Org Tab */}
      {isResident ? (
        <button
          onClick={onOpenReport}
          className="w-12 h-12 -mt-5 rounded-2xl bg-coral border-2 border-charcoal shadow-hard flex items-center justify-center text-charcoal font-black text-2xl active:scale-95 transition-transform"
          title="Report an Issue"
        >
          +
        </button>
      ) : (
        <button
          onClick={() => onSelectTab('org')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'org' ? 'bg-forest text-white shadow-hard-sm' : 'text-charcoal'
          }`}
        >
          <span className="text-lg leading-none">◆</span>
          <span className="font-nunito font-bold text-xs">Org Hub</span>
        </button>
      )}

      {/* Me / Profile Tab */}
      <button
        onClick={() => onSelectTab('me')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
          activeTab === 'me' ? 'bg-forest text-white shadow-hard-sm' : 'text-charcoal'
        }`}
      >
        <span className="text-lg leading-none">●</span>
        <span className="font-nunito font-bold text-xs">{isResident ? 'Me' : 'Org'}</span>
      </button>
    </nav>
  );
};
