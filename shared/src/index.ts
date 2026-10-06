export type LatLng = [number, number];

export type RoleType = 'resident' | 'org';

export type IssueCategory = 'Lighting' | 'Roads' | 'Trash' | 'Safety' | 'Parks' | 'Other';

export type IssueStatus = 'open' | 'progress' | 'fixed';

export interface OrganizationSummary {
  name: string;
  role: string;
  lead?: boolean;
}

export interface IssueUpdate {
  who: string;
  text: string;
  when: string;
}

export interface IssueTask {
  id?: string;
  t: string;
  who: string;
  done: boolean;
}

export interface IssueChatMessage {
  id?: string;
  who: string;
  text: string;
  createdAt?: string;
}

export interface Issue {
  id: string;
  title: string;
  cat: IssueCategory;
  votes: number;
  status: IssueStatus;
  ll: LatLng;
  by: string;
  ago: string;
  desc: string;
  event?: string;
  notified?: string | null;
  fit?: string | null;
  mine?: boolean;
  photo?: string | null;
  orgs: OrganizationSummary[];
  updates: IssueUpdate[];
  tasks: IssueTask[];
  thread: IssueChatMessage[];
}

export interface NeighborhoodEvent {
  id: string;
  title: string;
  org: string;
  cat: string;
  day: number;
  time: string;
  place: string;
  going: number;
  ll: LatLng;
  desc: string;
  issue?: string;
}

export type RsvpStatus = 'going' | 'maybe' | 'cant';

export interface RsvpRecord {
  eventId: string;
  status: RsvpStatus;
  group: number;
  remind: boolean;
}

export interface DuplicateIssueMatch {
  id: string;
  title: string;
  cat: IssueCategory;
  status: IssueStatus;
  votes: number;
  distanceMeters: number;
}

export interface OrgSuggestion {
  name: string;
  reason: string;
}

export interface UserPersona {
  role: RoleType;
  name: string;
  subtitle: string;
  orgName?: string;
}

export const CATEGORY_ORG_SUGGESTIONS: Record<IssueCategory, OrgSuggestion[]> = {
  Lighting: [
    { name: 'City Public Works', reason: 'Handles street lighting repairs across Elm Park.' },
    { name: 'Elm Park Neighbors', reason: 'Can rally neighbors and escalate with the city.' }
  ],
  Roads: [
    { name: 'City Public Works', reason: 'Pothole repairs and street maintenance.' },
    { name: 'District 4 Office', reason: 'Can prioritize traffic calming and repaving.' }
  ],
  Trash: [
    { name: 'Green Elm', reason: 'Runs volunteer cleanups and provides equipment.' },
    { name: 'City Sanitation', reason: 'Coordinates bulk pickup and dumpster delivery.' }
  ],
  Safety: [
    { name: 'District 4 Office', reason: 'Advocates for safe street crossings and signage.' },
    { name: 'Elm Park Neighbors', reason: 'Community watch and walking-bus volunteers.' }
  ],
  Parks: [
    { name: 'Green Elm', reason: 'Manages trail maintenance, tree planting, and parks.' },
    { name: 'Elm Arts Collective', reason: 'Activates parks with gatherings and installations.' }
  ],
  Other: [
    { name: 'Elm Park Neighbors', reason: 'General neighborhood coordination.' },
    { name: 'District 4 Office', reason: 'City council liaison.' }
  ]
};
