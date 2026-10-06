import React, { useState, useEffect, useCallback } from 'react';
import {
  Issue,
  NeighborhoodEvent,
  RsvpRecord,
  UserPersona,
  RoleType,
  DuplicateIssueMatch,
  LatLng,
  RsvpStatus
} from '@neighborly/shared';
import * as api from './services/api';
import { getSocket, joinIssueRoom, leaveIssueRoom } from './services/socket';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { NeighborhoodMap } from './components/NeighborhoodMap';
import { IssueFeedSheet } from './components/IssueFeedSheet';
import { IssueDetailModal } from './components/IssueDetailModal';
import { CoordinationScreen } from './components/CoordinationScreen';
import { ReportWizardModal } from './components/ReportWizardModal';
import { CalendarView } from './components/CalendarView';
import { EventDetailModal } from './components/EventDetailModal';
import { OrgWorkspace } from './components/OrgWorkspace';
import { ProfileDrawer } from './components/ProfileDrawer';
import { Toast } from './components/Toast';

export const App: React.FC = () => {
  // State
  const [issues, setIssues] = useState<Issue[]>([]);
  const [events, setEvents] = useState<NeighborhoodEvent[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, RsvpRecord>>({});
  const [upvoted, setUpvoted] = useState<Record<string, boolean>>({});
  const [persona, setPersona] = useState<UserPersona>({
    role: 'resident',
    name: 'Dana Rivera',
    subtitle: 'Elm Park · neighbor since 2024'
  });

  const [activeTab, setActiveTab] = useState<'map' | 'calendar' | 'org' | 'me'>('map');
  const [layer, setLayer] = useState<'both' | 'issues' | 'events'>('both');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<'none' | 'issue' | 'event' | 'coord'>('none');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFeedExpanded, setIsFeedExpanded] = useState<boolean>(false);

  // Reporting Wizard State
  const [reportStep, setReportStep] = useState<number | null>(null);
  const [draftPin, setDraftPin] = useState<LatLng | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateIssueMatch[]>([]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Initial Data Fetching
  useEffect(() => {
    const loadData = async () => {
      try {
        const [issuesRes, eventsRes, personaRes] = await Promise.all([
          api.fetchIssues(),
          api.fetchEvents(),
          api.fetchPersona()
        ]);
        setIssues(issuesRes.issues);
        setUpvoted(issuesRes.upvoted);
        setEvents(eventsRes.events);
        setRsvps(eventsRes.rsvps);
        setPersona(personaRes);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    loadData();
  }, []);

  // Socket.io Realtime Subscriptions
  useEffect(() => {
    const socket = getSocket();

    socket.on('issue:created', (newIssue: Issue) => {
      setIssues(prev => {
        if (prev.some(i => i.id === newIssue.id)) return prev;
        return [newIssue, ...prev];
      });
    });

    socket.on('issue:updated', (updated: Issue) => {
      setIssues(prev => prev.map(i => (i.id === updated.id ? updated : i)));
    });

    socket.on('issue:upvoted', ({ issueId, votes }: { issueId: string; votes: number }) => {
      setIssues(prev => prev.map(i => (i.id === issueId ? { ...i, votes } : i)));
    });

    socket.on('event:rsvp', ({ eventId, rsvp }: { eventId: string; rsvp: RsvpRecord }) => {
      setRsvps(prev => ({ ...prev, [eventId]: rsvp }));
    });

    socket.on('event:created', (newEvent: NeighborhoodEvent) => {
      setEvents(prev => {
        if (prev.some(e => e.id === newEvent.id)) return prev;
        return [...prev, newEvent];
      });
    });

    return () => {
      socket.off('issue:created');
      socket.off('issue:updated');
      socket.off('issue:upvoted');
      socket.off('event:rsvp');
      socket.off('event:created');
    };
  }, []);

  // Manage Issue Room for live chat when coordination screen is open
  useEffect(() => {
    if (activeScreen === 'coord' && selectedId) {
      joinIssueRoom(selectedId);
      return () => {
        leaveIssueRoom(selectedId);
      };
    }
  }, [activeScreen, selectedId]);

  // Persona Switching
  const handleSwitchPersona = async (role: RoleType) => {
    try {
      const updated = await api.switchPersona(role);
      setPersona(updated);
      setActiveScreen('none');
      setSelectedId(null);
      if (role === 'org' && activeTab === 'me') {
        setActiveTab('org');
      }
      showToast(`Switched view to ${updated.name} (${role})`);
    } catch {
      showToast('Failed to switch persona');
    }
  };

  // Upvote Action
  const handleToggleUpvote = async (issueId: string) => {
    try {
      const res = await api.toggleUpvote(issueId);
      setUpvoted(prev => ({ ...prev, [issueId]: res.upvoted }));
      setIssues(prev => prev.map(i => (i.id === issueId ? { ...i, votes: res.votes } : i)));
      showToast(res.upvoted ? 'Upvoted — thanks for adding your voice!' : 'Vote removed');
    } catch {
      showToast('Failed to toggle vote');
    }
  };

  // Pin Click from Map
  const handleSelectPin = (kind: 'issue' | 'event', id: string) => {
    setSelectedId(id);
    setActiveScreen(kind);
  };

  // Open Issue or Event
  const handleOpenIssue = (id: string) => {
    setSelectedId(id);
    setActiveScreen('issue');
  };

  const handleOpenEvent = (id: string) => {
    setSelectedId(id);
    setActiveScreen('event');
  };

  const handleOpenCoordination = (id: string) => {
    setSelectedId(id);
    setActiveScreen('coord');
  };

  // Start Reporting Flow
  const handleStartReport = () => {
    setReportStep(0);
    setDraftPin(null);
    setDuplicates([]);
  };

  const handleUseLocation = async () => {
    // Portland default with small offset for Elm Park pin
    const userLoc: LatLng = [45.52368, -122.67585];
    setDraftPin(userLoc);
    setReportStep(1);
    try {
      const dups = await api.fetchDuplicates(userLoc[0], userLoc[1], 250);
      setDuplicates(dups);
    } catch (e) {
      console.warn('Duplicate check error:', e);
    }
  };

  const handleConfirmLocation = () => {
    if (duplicates.length > 0) {
      setReportStep(2); // Duplicate check step
    } else {
      setReportStep(3); // Direct to details
    }
  };

  const handleUpvoteDuplicate = async (dupId: string) => {
    await handleToggleUpvote(dupId);
    setReportStep(null);
    setDraftPin(null);
    handleOpenIssue(dupId);
    showToast('Upvoted existing report — thanks for not doubling up!');
  };

  const handleProceedToDetails = () => {
    setReportStep(3);
  };

  const handleSubmitReport = async (formData: {
    title: string;
    cat: any;
    desc: string;
    photo: boolean;
    anon: boolean;
    notifiedOrg: string | null;
  }) => {
    if (!draftPin) return;
    try {
      const created = await api.createIssue({
        title: formData.title,
        cat: formData.cat,
        desc: formData.desc,
        ll: draftPin,
        by: persona.name,
        anon: formData.anon,
        notified: formData.notifiedOrg,
        fit: formData.notifiedOrg === 'Green Elm' ? 'a resident asked for your help directly.' : null
      });

      setIssues(prev => [created, ...prev]);
      setUpvoted(prev => ({ ...prev, [created.id]: true }));
      setReportStep(null);
      setDraftPin(null);
      handleOpenIssue(created.id);
      showToast(
        formData.notifiedOrg
          ? `Posted! ${formData.notifiedOrg} got an alert.`
          : "Posted to the neighborhood map!"
      );
    } catch {
      showToast('Failed to post report');
    }
  };

  // Volunteer Action
  const handleVolunteer = async (
    issueId: string,
    plan: string,
    when: string,
    createEvent: boolean
  ) => {
    try {
      const res = await api.volunteerOnIssue(issueId, {
        orgName: 'Green Elm',
        plan,
        when,
        createEvent
      });
      setIssues(prev => prev.map(i => (i.id === issueId ? res.issue : i)));
      if (res.eventId) {
        const eventsRes = await api.fetchEvents();
        setEvents(eventsRes.events);
      }
      showToast('Green Elm is on it! Progress posted for neighbors.');
    } catch {
      showToast('Failed to commit volunteer action');
    }
  };

  // Coordination screen handlers
  const handleToggleTask = async (taskIndex: number) => {
    if (!selectedId) return;
    try {
      const updated = await api.toggleIssueTask(selectedId, taskIndex);
      setIssues(prev => prev.map(i => (i.id === selectedId ? updated : i)));
    } catch {
      showToast('Failed to toggle task');
    }
  };

  const handleAddTask = async (t: string) => {
    if (!selectedId) return;
    try {
      const updated = await api.addIssueTask(selectedId, t, 'Green Elm');
      setIssues(prev => prev.map(i => (i.id === selectedId ? updated : i)));
      showToast('Task added for team');
    } catch {
      showToast('Failed to add task');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedId) return;
    try {
      const updated = await api.sendIssueMessage(selectedId, 'Green Elm', text);
      setIssues(prev => prev.map(i => (i.id === selectedId ? updated : i)));
    } catch {
      showToast('Failed to send message');
    }
  };

  const handlePostPublicUpdate = async (text: string) => {
    if (!selectedId) return;
    try {
      const updated = await api.postIssueUpdate(selectedId, 'Green Elm', text);
      setIssues(prev => prev.map(i => (i.id === selectedId ? updated : i)));
      showToast('Update posted for neighbors');
    } catch {
      showToast('Failed to post update');
    }
  };

  const handleInviteOrg = async (name: string) => {
    if (!selectedId) return;
    try {
      const updated = await api.inviteOrganization(selectedId, name);
      setIssues(prev => prev.map(i => (i.id === selectedId ? updated : i)));
      showToast(`Invited ${name}`);
    } catch {
      showToast('Failed to invite collaborator');
    }
  };

  const handleToggleIssueStatus = async () => {
    if (!selectedId) return;
    const cur = issues.find(i => i.id === selectedId);
    if (!cur) return;
    const nextStatus = cur.status === 'fixed' ? 'progress' : 'fixed';
    try {
      const updated = await api.setIssueStatus(selectedId, nextStatus, 'Green Elm');
      setIssues(prev => prev.map(i => (i.id === selectedId ? updated : i)));
      showToast(nextStatus === 'fixed' ? 'Marked as Fixed ✓ — Neighbors notified' : 'Issue reopened');
    } catch {
      showToast('Failed to update status');
    }
  };

  // RSVP submission
  const handleSubmitRsvp = async (status: RsvpStatus, group: number, remind: boolean) => {
    if (!selectedId) return;
    try {
      const record = await api.submitRsvp(selectedId, status, group, remind);
      setRsvps(prev => ({ ...prev, [selectedId]: record }));
      showToast(
        status === 'going'
          ? "You're in! We'll remind you the day before."
          : status === 'maybe'
          ? 'Marked as maybe.'
          : "Thanks for letting the host know."
      );
    } catch {
      showToast('Failed to submit RSVP');
    }
  };

  // Current entity lookups
  const selectedIssue = activeScreen === 'issue' || activeScreen === 'coord' ? issues.find(i => i.id === selectedId) : null;
  const selectedEvent = activeScreen === 'event' ? events.find(e => e.id === selectedId) : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-cream font-nunito">
      {/* Header */}
      <Header
        persona={persona}
        onSwitchPersona={handleSwitchPersona}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenReport={handleStartReport}
        onOpenProfile={() => setActiveTab('me')}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 relative flex overflow-hidden">
        {/* VIEW 1: Map View (Split screen on Desktop, Bottom Sheet on Mobile) */}
        {activeTab === 'map' && (
          <div className="w-full h-full flex flex-col md:flex-row relative">
            {/* Map Canvas */}
            <div className="flex-1 h-full relative">
              <NeighborhoodMap
                issues={issues}
                events={events}
                selectedId={selectedId}
                role={persona.role}
                layer={layer}
                onSelectPin={handleSelectPin}
                draftPin={draftPin}
                draftStep={reportStep || undefined}
                onDraftDragEnd={setDraftPin}
              />
            </div>

            {/* Desktop Side Panel or Mobile Bottom Sheet */}
            <div className="hidden md:block w-96 lg:w-[420px] h-full border-l-2 border-charcoal bg-surface z-20 shadow-hard overflow-hidden flex-none">
              {activeScreen === 'issue' && selectedIssue ? (
                <IssueDetailModal
                  issue={selectedIssue}
                  events={events}
                  isUpvoted={!!upvoted[selectedIssue.id]}
                  role={persona.role}
                  onClose={() => setActiveScreen('none')}
                  onToggleUpvote={handleToggleUpvote}
                  onOpenEvent={handleOpenEvent}
                  onOpenCoordination={handleOpenCoordination}
                  onVolunteer={handleVolunteer}
                />
              ) : activeScreen === 'coord' && selectedIssue ? (
                <CoordinationScreen
                  issue={selectedIssue}
                  onBack={() => setActiveScreen('issue')}
                  onToggleTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  onSendMessage={handleSendMessage}
                  onPostPublicUpdate={handlePostPublicUpdate}
                  onInviteOrg={handleInviteOrg}
                  onToggleStatus={handleToggleIssueStatus}
                />
              ) : activeScreen === 'event' && selectedEvent ? (
                <EventDetailModal
                  event={selectedEvent}
                  rsvpRecord={rsvps[selectedEvent.id] || null}
                  onClose={() => setActiveScreen('none')}
                  onSubmitRsvp={handleSubmitRsvp}
                  onOpenLinkedIssue={handleOpenIssue}
                  onShowOnMap={() => {}}
                />
              ) : (
                <IssueFeedSheet
                  issues={issues}
                  events={events}
                  layer={layer}
                  onSelectLayer={setLayer}
                  onSelectIssue={handleOpenIssue}
                  onSelectEvent={handleOpenEvent}
                  isExpanded={true}
                  onToggleExpand={() => {}}
                />
              )}
            </div>

            {/* Mobile Bottom Drawer */}
            <div className="md:hidden absolute bottom-14 left-0 right-0 z-30 max-h-[75vh] bg-surface rounded-t-3xl border-t-2 border-charcoal shadow-hard-lg overflow-hidden">
              {activeScreen === 'issue' && selectedIssue ? (
                <div className="max-h-[75vh]">
                  <IssueDetailModal
                    issue={selectedIssue}
                    events={events}
                    isUpvoted={!!upvoted[selectedIssue.id]}
                    role={persona.role}
                    onClose={() => setActiveScreen('none')}
                    onToggleUpvote={handleToggleUpvote}
                    onOpenEvent={handleOpenEvent}
                    onOpenCoordination={handleOpenCoordination}
                    onVolunteer={handleVolunteer}
                  />
                </div>
              ) : activeScreen === 'coord' && selectedIssue ? (
                <div className="max-h-[75vh]">
                  <CoordinationScreen
                    issue={selectedIssue}
                    onBack={() => setActiveScreen('issue')}
                    onToggleTask={handleToggleTask}
                    onAddTask={handleAddTask}
                    onSendMessage={handleSendMessage}
                    onPostPublicUpdate={handlePostPublicUpdate}
                    onInviteOrg={handleInviteOrg}
                    onToggleStatus={handleToggleIssueStatus}
                  />
                </div>
              ) : activeScreen === 'event' && selectedEvent ? (
                <div className="max-h-[75vh]">
                  <EventDetailModal
                    event={selectedEvent}
                    rsvpRecord={rsvps[selectedEvent.id] || null}
                    onClose={() => setActiveScreen('none')}
                    onSubmitRsvp={handleSubmitRsvp}
                    onOpenLinkedIssue={handleOpenIssue}
                    onShowOnMap={() => setActiveScreen('none')}
                  />
                </div>
              ) : (
                <IssueFeedSheet
                  issues={issues}
                  events={events}
                  layer={layer}
                  onSelectLayer={setLayer}
                  onSelectIssue={handleOpenIssue}
                  onSelectEvent={handleOpenEvent}
                  isExpanded={isFeedExpanded}
                  onToggleExpand={() => setIsFeedExpanded(!isFeedExpanded)}
                />
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Calendar View */}
        {activeTab === 'calendar' && (
          <div className="w-full h-full flex flex-col md:flex-row relative">
            <div className="flex-1 h-full overflow-hidden">
              <CalendarView
                events={events}
                rsvps={rsvps}
                onSelectEvent={handleOpenEvent}
              />
            </div>
            {/* If event is selected on desktop, show in right panel */}
            {selectedEvent && (
              <div className="hidden md:block w-96 lg:w-[420px] h-full border-l-2 border-charcoal bg-surface z-20 shadow-hard">
                <EventDetailModal
                  event={selectedEvent}
                  rsvpRecord={rsvps[selectedEvent.id] || null}
                  onClose={() => setSelectedId(null)}
                  onSubmitRsvp={handleSubmitRsvp}
                  onOpenLinkedIssue={handleOpenIssue}
                  onShowOnMap={() => {
                    setActiveTab('map');
                    setActiveScreen('event');
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Organization Workspace */}
        {activeTab === 'org' && (
          <div className="w-full h-full flex flex-col md:flex-row relative">
            <div className="flex-1 h-full overflow-hidden">
              <OrgWorkspace
                issues={issues}
                onOpenIssue={handleOpenIssue}
                onOpenCoordination={handleOpenCoordination}
              />
            </div>
            {/* If issue/coord is open on desktop */}
            {selectedIssue && (
              <div className="hidden md:block w-96 lg:w-[420px] h-full border-l-2 border-charcoal bg-surface z-20 shadow-hard">
                {activeScreen === 'coord' ? (
                  <CoordinationScreen
                    issue={selectedIssue}
                    onBack={() => setActiveScreen('issue')}
                    onToggleTask={handleToggleTask}
                    onAddTask={handleAddTask}
                    onSendMessage={handleSendMessage}
                    onPostPublicUpdate={handlePostPublicUpdate}
                    onInviteOrg={handleInviteOrg}
                    onToggleStatus={handleToggleIssueStatus}
                  />
                ) : (
                  <IssueDetailModal
                    issue={selectedIssue}
                    events={events}
                    isUpvoted={!!upvoted[selectedIssue.id]}
                    role={persona.role}
                    onClose={() => setSelectedId(null)}
                    onToggleUpvote={handleToggleUpvote}
                    onOpenEvent={handleOpenEvent}
                    onOpenCoordination={handleOpenCoordination}
                    onVolunteer={handleVolunteer}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: Profile / Me View */}
        {activeTab === 'me' && (
          <div className="w-full h-full max-w-2xl mx-auto overflow-hidden">
            <ProfileDrawer
              persona={persona}
              issues={issues}
              events={events}
              rsvps={rsvps}
              onClose={() => setActiveTab('map')}
              onSelectIssue={id => {
                setActiveTab('map');
                handleOpenIssue(id);
              }}
              onSelectEvent={id => {
                setActiveTab('calendar');
                handleOpenEvent(id);
              }}
            />
          </div>
        )}
      </main>

      {/* 4-Step Issue Reporting Wizard Modal */}
      {reportStep !== null && (
        <ReportWizardModal
          step={reportStep}
          draftPin={draftPin}
          duplicates={duplicates}
          onClose={() => {
            setReportStep(null);
            setDraftPin(null);
          }}
          onUseLocation={handleUseLocation}
          onConfirmLocation={handleConfirmLocation}
          onUpvoteDuplicate={handleUpvoteDuplicate}
          onProceedToDetails={handleProceedToDetails}
          onBack={() => setReportStep(Math.max(0, (reportStep || 1) - 1))}
          onSubmit={handleSubmitReport}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        role={persona.role}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenReport={handleStartReport}
      />

      {/* Toast Notification Banner */}
      <Toast message={toastMessage} />
    </div>
  );
};
