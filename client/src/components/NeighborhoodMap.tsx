import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Issue, NeighborhoodEvent, LatLng, RoleType } from '@neighborly/shared';

const RESIDENT_LOCATION: LatLng = [45.5236, -122.6758];
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface NeighborhoodMapProps {
  issues: Issue[];
  events: NeighborhoodEvent[];
  selectedId: string | null;
  role: RoleType;
  layer: 'both' | 'issues' | 'events';
  onSelectPin: (kind: 'issue' | 'event', id: string) => void;
  draftPin: LatLng | null;
  draftStep?: number;
  onDraftDragEnd?: (ll: LatLng) => void;
}

export const NeighborhoodMap: React.FC<NeighborhoodMapProps> = ({
  issues,
  events,
  selectedId,
  role,
  layer,
  onSelectPin,
  draftPin,
  draftStep,
  onDraftDragEnd
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView([45.5236, -122.6765], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Resident Location Pulse Pin
    if (role === 'resident') {
      const pulseHtml = `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(47,111,79,0.35);animation:nbPulse 2s ease-out infinite;"></div>
          <div style="position:relative;width:16px;height:16px;border-radius:50%;background:#2f6f4f;border:3px solid #fff;box-shadow:0 0 0 2px #1d2a24;"></div>
        </div>
      `;
      const pulseIcon = L.divIcon({
        html: pulseHtml,
        className: '',
        iconSize: [0, 0]
      });
      L.marker(RESIDENT_LOCATION, { icon: pulseIcon, zIndexOffset: -100 }).addTo(group);
    }

    // Pin generator helper
    const createPinHtml = (kind: 'issue' | 'event' | 'draft', label: string, isSelected: boolean) => {
      const bg = kind === 'event' ? '#4a86e0' : kind === 'draft' ? '#ec7a4f' : '#ec7a4f';
      const fg = kind === 'event' ? '#ffffff' : '#1d2a24';
      const scale = isSelected ? 1.18 : 1;
      const outline = isSelected ? 'outline: 3px solid #f7c948; outline-offset: 1px;' : '';

      return `
        <div style="position:absolute;transform:translate(-50%,-100%) scale(${scale});transform-origin:50% 100%;display:flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform 0.15s ease;">
          <div style="background:${bg};color:${fg};border:2.5px solid #1d2a24;border-radius:${kind === 'event' ? '999px' : '9px'};padding:3px 9px;font:800 13px Nunito,sans-serif;white-space:nowrap;box-shadow:2px 2px 0 #1d2a24;${outline}">
            ${label}
          </div>
          <div style="width:10px;height:10px;background:${bg};border:2.5px solid #1d2a24;border-top:none;border-left:none;transform:rotate(45deg);margin-top:-7px;"></div>
        </div>
      `;
    };

    // 2. Event Markers
    if (layer !== 'issues') {
      events.forEach(e => {
        const isSelected = e.id === selectedId;
        const text = `${WD[(e.day - 1) % 7]} ${e.day}`;
        const icon = L.divIcon({
          html: createPinHtml('event', text, isSelected),
          className: '',
          iconSize: [0, 0]
        });

        const marker = L.marker(e.ll, {
          icon,
          zIndexOffset: isSelected ? 600 : 50
        });

        marker.on('click', () => {
          onSelectPin('event', e.id);
          map.panTo(e.ll, { animate: true });
        });

        marker.addTo(group);
      });
    }

    // 3. Issue Markers
    if (layer !== 'events') {
      issues
        .filter(i => i.status !== 'fixed')
        .forEach(i => {
          const isSelected = i.id === selectedId;
          const text = `▲ ${i.votes}`;
          const icon = L.divIcon({
            html: createPinHtml('issue', text, isSelected),
            className: '',
            iconSize: [0, 0]
          });

          const marker = L.marker(i.ll, {
            icon,
            zIndexOffset: isSelected ? 650 : 100
          });

          marker.on('click', () => {
            onSelectPin('issue', i.id);
            map.panTo(i.ll, { animate: true });
          });

          marker.addTo(group);
        });
    }

    // 4. Draft Pin (When user is reporting an issue)
    if (draftPin) {
      const isDraggable = draftStep === 1;
      const label = isDraggable ? 'Drag me' : 'Your issue';
      const draftIcon = L.divIcon({
        html: createPinHtml('draft', label, true),
        className: '',
        iconSize: [0, 0]
      });

      const draftMarker = L.marker(draftPin, {
        icon: draftIcon,
        draggable: isDraggable,
        zIndexOffset: 1000
      });

      if (isDraggable && onDraftDragEnd) {
        draftMarker.on('dragend', e => {
          const p = (e.target as L.Marker).getLatLng();
          onDraftDragEnd([p.lat, p.lng]);
        });
      }

      draftMarker.addTo(group);
    }
  }, [issues, events, selectedId, role, layer, draftPin, draftStep, onSelectPin, onDraftDragEnd]);

  // Handle Recenter
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(RESIDENT_LOCATION, 16, { duration: 0.6 });
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Recenter Button */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-20 sm:bottom-6 right-4 z-[400] w-11 h-11 bg-surface border-2 border-charcoal shadow-hard rounded-xl flex items-center justify-center text-charcoal hover:bg-cream transition-transform active:scale-95"
        title="Recenter Map"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 2v3m0 14v3M2 12h3m14 0h3"></path>
        </svg>
      </button>
    </div>
  );
};
