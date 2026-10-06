import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import express from 'express';
import cors from 'cors';
import issuesRouter from '../routes/issues.js';
import eventsRouter from '../routes/events.js';
import personaRouter from '../routes/persona.js';
import { initSocket } from '../socket.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/issues', issuesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/persona', personaRouter);

const server = http.createServer(app);
let port: number;
let baseUrl: string;

describe('Neighborly Fullstack API Integration Tests', () => {
  before(async () => {
    initSocket(server);
    await new Promise<void>(resolve => {
      server.listen(0, () => {
        const addr = server.address();
        port = typeof addr === 'object' && addr ? addr.port : 3001;
        baseUrl = `http://localhost:${port}/api`;
        resolve();
      });
    });
  });

  after(() => {
    server.close();
  });

  it('1. GET /api/issues returns seed issues and upvote map', async () => {
    const res = await fetch(`${baseUrl}/issues`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data.issues), 'issues should be an array');
    assert(data.issues.length >= 6, 'should contain at least 6 seed issues');
    assert(typeof data.upvoted === 'object', 'upvoted should be an object');
  });

  it('2. GET /api/events returns seed events and RSVPs', async () => {
    const res = await fetch(`${baseUrl}/events`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data.events), 'events should be an array');
    assert(data.events.length >= 8, 'should contain seed events');
    assert(data.rsvps.e2, 'should contain initial rsvp for e2');
  });

  it('3. GET /api/issues/duplicates identifies nearby duplicate reports within radius', async () => {
    // 5th & Elm coordinates (near i1: [45.5240, -122.6762])
    const res = await fetch(`${baseUrl}/issues/duplicates?lat=45.5241&lng=-122.6763&radius=250`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data.duplicates), 'duplicates should be array');
    assert(data.duplicates.some((d: any) => d.id === 'i1'), 'should detect i1 streetlight as nearby');
  });

  it('4. POST /api/issues creates a new community issue report', async () => {
    const payload = {
      title: 'Damaged bench in Birch Park',
      cat: 'Parks',
      desc: 'Wooden slat is broken on the south bench.',
      ll: [45.5210, -122.6750],
      by: 'Dana Rivera',
      notified: 'Green Elm'
    };

    const res = await fetch(`${baseUrl}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.issue.title, payload.title);
    assert.strictEqual(data.issue.cat, 'Parks');
    assert.strictEqual(data.issue.votes, 1);
  });

  it('5. POST /api/issues/:id/upvote increments and decrements votes', async () => {
    const initialRes = await fetch(`${baseUrl}/issues/i3`);
    const initialData = await initialRes.json();
    const initialVotes = initialData.issue.votes;

    // First toggle: vote
    const upRes = await fetch(`${baseUrl}/issues/i3/upvote`, { method: 'POST' });
    assert.strictEqual(upRes.status, 200);
    const upData = await upRes.json();
    assert.strictEqual(upData.votes, initialVotes + 1);
    assert.strictEqual(upData.upvoted, true);

    // Second toggle: unvote
    const downRes = await fetch(`${baseUrl}/issues/i3/upvote`, { method: 'POST' });
    assert.strictEqual(downRes.status, 200);
    const downData = await downRes.json();
    assert.strictEqual(downData.votes, initialVotes);
    assert.strictEqual(downData.upvoted, false);
  });

  it('6. POST /api/issues/:id/volunteer assigns organization and creates linked event', async () => {
    const payload = {
      orgName: 'Green Elm',
      plan: 'Green Elm volunteers will clear trail and replace slats',
      when: 'This Saturday',
      createEvent: true
    };

    const res = await fetch(`${baseUrl}/issues/i5/volunteer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.issue.status, 'progress');
    assert(data.issue.orgs.some((o: any) => o.name === 'Green Elm'));
    assert(data.eventId, 'should have created a linked fix-it event');
  });

  it('7. POST & PATCH tasks on issue coordination board', async () => {
    // Add task
    const addRes = await fetch(`${baseUrl}/issues/i2/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ t: 'Confirm volunteer waiver forms', who: 'Green Elm' })
    });
    assert.strictEqual(addRes.status, 200);
    const addData = await addRes.json();
    const taskIdx = addData.issue.tasks.length - 1;
    assert.strictEqual(addData.issue.tasks[taskIdx].t, 'Confirm volunteer waiver forms');

    // Toggle task
    const toggleRes = await fetch(`${baseUrl}/issues/i2/tasks/${taskIdx}/toggle`, {
      method: 'PATCH'
    });
    assert.strictEqual(toggleRes.status, 200);
    const toggleData = await toggleRes.json();
    assert.strictEqual(toggleData.issue.tasks[taskIdx].done, true);
  });

  it('8. POST /api/issues/:id/messages adds inter-org private chat message', async () => {
    const res = await fetch(`${baseUrl}/issues/i2/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ who: 'Green Elm', text: 'Truck confirmed for 9am pickup.' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const lastMsg = data.issue.thread[data.issue.thread.length - 1];
    assert.strictEqual(lastMsg.text, 'Truck confirmed for 9am pickup.');
  });

  it('9. POST /api/events/:id/rsvp records community RSVP with group size', async () => {
    const res = await fetch(`${baseUrl}/events/e1/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'going', group: 3, remind: true })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.rsvp.status, 'going');
    assert.strictEqual(data.rsvp.group, 3);
    assert.strictEqual(data.rsvp.remind, true);
  });

  it('10. POST /api/persona switches active persona between resident and organization', async () => {
    const res = await fetch(`${baseUrl}/persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'org' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.persona.role, 'org');
    assert.strictEqual(data.persona.name, 'Green Elm');
  });
});
