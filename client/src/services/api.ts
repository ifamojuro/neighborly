import {
  Issue,
  NeighborhoodEvent,
  RsvpRecord,
  DuplicateIssueMatch,
  UserPersona,
  IssueCategory,
  LatLng
} from '@neighborly/shared';

const API_BASE = '/api';

export async function fetchIssues(): Promise<{ issues: Issue[]; upvoted: Record<string, boolean> }> {
  const res = await fetch(`${API_BASE}/issues`);
  if (!res.ok) throw new Error('Failed to fetch issues');
  return res.json();
}

export async function fetchEvents(): Promise<{ events: NeighborhoodEvent[]; rsvps: Record<string, RsvpRecord> }> {
  const res = await fetch(`${API_BASE}/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchDuplicates(lat: number, lng: number, radius = 250): Promise<DuplicateIssueMatch[]> {
  const res = await fetch(`${API_BASE}/issues/duplicates?lat=${lat}&lng=${lng}&radius=${radius}`);
  if (!res.ok) throw new Error('Failed to fetch duplicate issues');
  const data = await res.json();
  return data.duplicates || [];
}

export async function createIssue(payload: {
  title: string;
  cat: IssueCategory;
  desc: string;
  ll: LatLng;
  by?: string;
  anon?: boolean;
  notified?: string | null;
  fit?: string | null;
}): Promise<Issue> {
  const res = await fetch(`${API_BASE}/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create issue');
  const data = await res.json();
  return data.issue;
}

export async function toggleUpvote(issueId: string): Promise<{ votes: number; upvoted: boolean }> {
  const res = await fetch(`${API_BASE}/issues/${issueId}/upvote`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to toggle upvote');
  return res.json();
}

export async function volunteerOnIssue(
  issueId: string,
  payload: { orgName: string; plan: string; when: string; createEvent: boolean }
): Promise<{ issue: Issue; eventId?: string }> {
  const res = await fetch(`${API_BASE}/issues/${issueId}/volunteer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to volunteer on issue');
  return res.json();
}

export async function postIssueUpdate(issueId: string, who: string, text: string): Promise<Issue> {
  const res = await fetch(`${API_BASE}/issues/${issueId}/updates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ who, text })
  });
  if (!res.ok) throw new Error('Failed to post update');
  const data = await res.json();
  return data.issue;
}

export async function setIssueStatus(issueId: string, status: 'open' | 'progress' | 'fixed', who?: string): Promise<Issue> {
  const res = await fetch(`${API_BASE}/issues/${issueId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, who })
  });
  if (!res.ok) throw new Error('Failed to update status');
  const data = await res.json();
  return data.issue;
}

export async function addIssueTask(issueId: string, t: string, who: string): Promise<Issue> {
  const res = await fetch(`${API_BASE}/issues/${issueId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ t, who })
  });
  if (!res.ok) throw new Error('Failed to add task');
  const data = await res.json();
  return data.issue;
}

export async function toggleIssueTask(issueId: string, taskIndex: number): Promise<Issue> {
  const res = await fetch(`${API_BASE}/issues/${issueId}/tasks/${taskIndex}/toggle`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to toggle task');
  const data = await res.json();
  return data.issue;
}

export async function sendIssueMessage(issueId: string, who: string, text: string): Promise<Issue> {
  const res = await fetch(`${API_BASE}/issues/${issueId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ who, text })
  });
  if (!res.ok) throw new Error('Failed to send message');
  const data = await res.json();
  return data.issue;
}

export async function inviteOrganization(issueId: string, name: string): Promise<Issue> {
  const res = await fetch(`${API_BASE}/issues/${issueId}/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to invite organization');
  const data = await res.json();
  return data.issue;
}

export async function submitRsvp(
  eventId: string,
  status: 'going' | 'maybe' | 'cant',
  group = 1,
  remind = true
): Promise<RsvpRecord> {
  const res = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, group, remind })
  });
  if (!res.ok) throw new Error('Failed to submit RSVP');
  const data = await res.json();
  return data.rsvp;
}

export async function fetchPersona(): Promise<UserPersona> {
  const res = await fetch(`${API_BASE}/persona`);
  if (!res.ok) throw new Error('Failed to fetch persona');
  const data = await res.json();
  return data.persona;
}

export async function switchPersona(role: 'resident' | 'org'): Promise<UserPersona> {
  const res = await fetch(`${API_BASE}/persona`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  if (!res.ok) throw new Error('Failed to switch persona');
  const data = await res.json();
  return data.persona;
}
