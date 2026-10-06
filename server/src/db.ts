import fs from 'fs';
import path from 'path';
import {
  Issue,
  NeighborhoodEvent,
  RsvpRecord,
  DuplicateIssueMatch,
  UserPersona,
  LatLng
} from '@neighborly/shared';

interface DatabaseSchema {
  issues: Issue[];
  events: NeighborhoodEvent[];
  rsvps: Record<string, RsvpRecord>;
  upvoted: Record<string, boolean>;
  persona: UserPersona;
}

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function seedDatabase(): DatabaseSchema {
  const events: NeighborhoodEvent[] = [
    {
      id: 'e1',
      title: 'Spring Block Party',
      org: 'Elm Park Neighbors',
      cat: 'Community',
      day: 14,
      time: '2 – 6 pm',
      place: 'Elm St, between 4th & 6th',
      going: 42,
      ll: [45.5236, -122.6758],
      desc: 'Our annual street party! Potluck tables, sidewalk chalk for kids, live porch music at 4pm, and a table where you can meet the groups working on Elm Park.'
    },
    {
      id: 'e2',
      title: 'Story Hour & Crafts',
      org: 'Elm Branch Library',
      cat: 'Kids',
      day: 14,
      time: '10 – 11 am',
      place: 'Elm Branch Library, Room B',
      going: 28,
      ll: [45.5222, -122.6736],
      desc: 'Family story time featuring books about neighborhood gardens. Materials for paper-pot seedling crafts provided. All ages welcome.'
    },
    {
      id: 'e3',
      title: 'Oak Lot Cleanup',
      org: 'Green Elm',
      cat: 'Volunteer',
      day: 15,
      time: '9 – 11 am',
      place: 'Oak Lot, Oak Ave & 7th',
      going: 19,
      ll: [45.5262, -122.6749],
      desc: 'Fix-it day tackling the litter behind the fence. Green Elm brings bags, grabbers, and gloves. City Sanitation dropped a dumpster Friday afternoon.',
      issue: 'i2'
    },
    {
      id: 'e4',
      title: 'Porch Jazz Night',
      org: 'Elm Arts Collective',
      cat: 'Arts',
      day: 15,
      time: '6 – 8 pm',
      place: 'Porches along 4th Ave',
      going: 11,
      ll: [45.5204, -122.6773],
      desc: 'Local musicians playing acoustic sets from three neighboring front porches. Stroll with a cider and meet your neighbors.'
    },
    {
      id: 'e5',
      title: 'Tenant Rights Q&A',
      org: 'District 4 Office',
      cat: 'Civic',
      day: 17,
      time: '7 – 8:30 pm',
      place: 'Elm Community Center',
      going: 23,
      ll: [45.5228, -122.6788],
      desc: 'Informal session on new city housing rules, repair timelines, and rent increases. Free child care provided by Elm Park Neighbors.'
    },
    {
      id: 'e6',
      title: 'Saturday Farmers Market',
      org: 'Elm Park Neighbors',
      cat: 'Food',
      day: 21,
      time: '8 am – 1 pm',
      place: 'Birch Park lawn',
      going: 64,
      ll: [45.5211, -122.6752],
      desc: 'Fresh produce, baked goods, and hot coffee from local vendors. SNAP matching tokens available at the info tent.'
    },
    {
      id: 'e7',
      title: 'Seed Swap',
      org: 'Green Elm',
      cat: 'Community',
      day: 7,
      time: '11 am – 1 pm',
      place: 'Elm Branch Library',
      going: 16,
      ll: [45.5222, -122.6736],
      desc: 'Bring seeds from your garden or take home heirloom tomato and flower packets for the spring season.'
    },
    {
      id: 'e8',
      title: 'Bike Repair Pop-up',
      org: 'Oak St Hardware',
      cat: 'Community',
      day: 28,
      time: '10 am – 2 pm',
      place: 'Oak St Hardware lot',
      going: 9,
      ll: [45.5248, -122.6738],
      desc: 'Free tune-ups, tire pumps, and brake adjustments. Volunteer mechanics on hand to teach you how to patch a tube.'
    }
  ];

  const issues: Issue[] = [
    {
      id: 'i1',
      title: 'Broken streetlight at 5th & Elm',
      cat: 'Lighting',
      votes: 87,
      status: 'progress',
      ll: [45.5240, -122.6762],
      by: 'Dana R.',
      ago: '3 days ago',
      desc: "The corner light has been out for over a week. It's really dark walking home from the 4th Ave bus stop at night.",
      orgs: [
        { name: 'City Public Works', role: 'Replacing the fixture', lead: true }
      ],
      updates: [
        { who: 'City Public Works', text: 'Crew scheduled for Thursday.', when: 'Yesterday' },
        { who: 'Dana R.', text: 'Reported the issue.', when: '3 days ago' }
      ],
      tasks: [],
      thread: []
    },
    {
      id: 'i2',
      title: 'Litter piling up in Oak Lot',
      cat: 'Trash',
      votes: 23,
      status: 'progress',
      ll: [45.5266, -122.6747],
      by: 'Marco T.',
      ago: '4 days ago',
      event: 'e3',
      desc: "Bags and bulky trash dumped behind the fence. It's starting to attract rats and block the sidewalk.",
      orgs: [
        { name: 'Green Elm', role: 'Volunteer cleanup crew', lead: true },
        { name: 'City Sanitation', role: 'Dumpster + bulk pickup' },
        { name: 'Oak St Hardware', role: 'Donating bags & gloves' }
      ],
      updates: [
        { who: 'Green Elm', text: 'Cleanup set for Sunday 9am — RSVP to help!', when: 'Today' },
        { who: 'City Sanitation', text: 'Dumpster arriving Friday afternoon.', when: 'Yesterday' },
        { who: 'Marco T.', text: 'Reported the issue.', when: '4 days ago' }
      ],
      tasks: [
        { id: 't1', t: 'Assess the site', who: 'Green Elm', done: true },
        { id: 't2', t: 'Drop dumpster Friday', who: 'City Sanitation', done: false },
        { id: 't3', t: 'Deliver bags & gloves', who: 'Oak St Hardware', done: false },
        { id: 't4', t: 'Run Sunday cleanup', who: 'Green Elm', done: false }
      ],
      thread: [
        { id: 'm1', who: 'City Sanitation', text: 'We can drop the dumpster Friday after 2pm.' },
        { id: 'm2', who: 'Green Elm', text: "Perfect — we'll meet them and make sure the gate is unlocked." },
        { id: 'm3', who: 'Oak St Hardware', text: 'Left 4 boxes of heavy-duty bags by your back door.' }
      ]
    },
    {
      id: 'i3',
      title: 'Pothole on Oak Ave',
      cat: 'Roads',
      votes: 52,
      status: 'open',
      ll: [45.5256, -122.6772],
      by: 'Priya S.',
      ago: '1 week ago',
      notified: 'City Public Works',
      desc: 'Deep pothole in the bike lane near 6th Ave. Multiple cyclists have swerved into car traffic to avoid it.',
      orgs: [],
      updates: [
        { who: 'Priya S.', text: 'Reported the issue and notified City Public Works.', when: '1 week ago' }
      ],
      tasks: [],
      thread: []
    },
    {
      id: 'i4',
      title: 'Faded crosswalk by Elm Elementary',
      cat: 'Safety',
      votes: 31,
      status: 'open',
      ll: [45.5226, -122.6792],
      by: 'Lena W.',
      ago: '5 days ago',
      notified: 'District 4 Office',
      desc: 'The zebra stripes are almost completely worn off. Drivers turn fast without seeing pedestrians during morning drop-off.',
      orgs: [],
      updates: [
        { who: 'Lena W.', text: 'Reported the issue.', when: '5 days ago' }
      ],
      tasks: [],
      thread: []
    },
    {
      id: 'i5',
      title: 'Overgrown path in Birch Park',
      cat: 'Parks',
      votes: 14,
      status: 'open',
      ll: [45.5207, -122.6748],
      by: 'Sam K.',
      ago: '2 days ago',
      fit: 'you run monthly park maintenance days here.',
      desc: 'Blackberries and nettles have grown into the east walking path, narrowing it to single file.',
      orgs: [],
      updates: [
        { who: 'Sam K.', text: 'Reported the issue.', when: '2 days ago' }
      ],
      tasks: [],
      thread: []
    },
    {
      id: 'i6',
      title: 'Overflowing bin at the 4th Ave bus stop',
      cat: 'Trash',
      votes: 6,
      status: 'open',
      ll: [45.5233, -122.6800],
      by: 'Jo M.',
      ago: 'Yesterday',
      fit: 'you coordinate with City Sanitation on bin service.',
      desc: 'Coffee cups and takeout containers blowing into the street.',
      orgs: [],
      updates: [
        { who: 'Jo M.', text: 'Reported the issue.', when: 'Yesterday' }
      ],
      tasks: [],
      thread: []
    }
  ];

  return {
    issues,
    events,
    rsvps: {
      e2: { eventId: 'e2', status: 'going', group: 1, remind: true }
    },
    upvoted: {},
    persona: {
      role: 'resident',
      name: 'Dana Rivera',
      subtitle: 'Elm Park · neighbor since 2024'
    }
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch {
        this.data = seedDatabase();
        this.save();
      }
    } else {
      this.data = seedDatabase();
      this.save();
    }
  }

  private save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // --- Issues ---
  getIssues(): Issue[] {
    return this.data.issues;
  }

  getIssue(id: string): Issue | undefined {
    return this.data.issues.find(i => i.id === id);
  }

  createIssue(issue: Issue): Issue {
    this.data.issues.unshift(issue);
    this.save();
    return issue;
  }

  updateIssue(id: string, updater: (issue: Issue) => Issue): Issue | undefined {
    const idx = this.data.issues.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    const updated = updater({ ...this.data.issues[idx] });
    this.data.issues[idx] = updated;
    this.save();
    return updated;
  }

  toggleUpvote(id: string): { votes: number; upvoted: boolean } | undefined {
    const issue = this.getIssue(id);
    if (!issue) return undefined;
    const current = !!this.data.upvoted[id];
    const next = !current;
    this.data.upvoted[id] = next;
    issue.votes += next ? 1 : -1;
    this.save();
    return { votes: issue.votes, upvoted: next };
  }

  getUpvoted(): Record<string, boolean> {
    return this.data.upvoted;
  }

  // --- Events ---
  getEvents(): NeighborhoodEvent[] {
    return this.data.events;
  }

  getEvent(id: string): NeighborhoodEvent | undefined {
    return this.data.events.find(e => e.id === id);
  }

  createEvent(event: NeighborhoodEvent): NeighborhoodEvent {
    this.data.events.push(event);
    this.save();
    return event;
  }

  // --- RSVPs ---
  getRsvps(): Record<string, RsvpRecord> {
    return this.data.rsvps;
  }

  setRsvp(eventId: string, status: 'going' | 'maybe' | 'cant', group: number, remind: boolean): RsvpRecord {
    const record: RsvpRecord = { eventId, status, group, remind };
    this.data.rsvps[eventId] = record;
    this.save();
    return record;
  }

  // --- Persona ---
  getPersona(): UserPersona {
    return this.data.persona;
  }

  setPersona(persona: UserPersona): UserPersona {
    this.data.persona = persona;
    this.save();
    return persona;
  }

  // --- Geospatial: Deduplication via Haversine Distance ---
  findNearbyDuplicates(targetLl: LatLng, radiusMeters: number = 250): DuplicateIssueMatch[] {
    const [targetLat, targetLng] = targetLl;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters

    const matches: DuplicateIssueMatch[] = [];

    for (const issue of this.data.issues) {
      if (issue.status === 'fixed') continue;

      const [iLat, iLng] = issue.ll;
      const dLat = toRad(iLat - targetLat);
      const dLng = toRad(iLng - targetLng);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(targetLat)) * Math.cos(toRad(iLat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;

      if (dist <= radiusMeters) {
        matches.push({
          id: issue.id,
          title: issue.title,
          cat: issue.cat,
          status: issue.status,
          votes: issue.votes,
          distanceMeters: Math.round(dist)
        });
      }
    }

    return matches.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }
}

export const db = new Database();
