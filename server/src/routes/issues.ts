import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import {
  broadcastIssueCreated,
  broadcastIssueUpdated,
  broadcastUpvote,
  broadcastEventCreated
} from '../socket.js';
import { Issue, NeighborhoodEvent } from '@neighborly/shared';

const router = Router();

// GET all issues
router.get('/', (_req: Request, res: Response) => {
  const issues = db.getIssues();
  const upvoted = db.getUpvoted();
  res.json({ issues, upvoted });
});

// GET duplicate candidates near a coordinate
router.get('/duplicates', (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const radius = req.query.radius ? parseFloat(req.query.radius as string) : 250;

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Valid lat and lng query parameters required' });
  }

  const duplicates = db.findNearbyDuplicates([lat, lng], radius);
  res.json({ duplicates });
});

// GET single issue
router.get('/:id', (req: Request, res: Response) => {
  const issue = db.getIssue(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  res.json({ issue });
});

// POST report a new issue
router.post('/', (req: Request, res: Response) => {
  const { title, cat, desc, ll, by, anon, notified, fit } = req.body;

  if (!cat || !ll || !Array.isArray(ll) || ll.length !== 2) {
    return res.status(400).json({ error: 'Category and location coordinates are required' });
  }

  const reporter = anon ? 'A neighbor' : (by || 'You');
  const issueTitle = (title || '').trim() || `${cat} issue near your spot`;
  const issueDesc = (desc || '').trim() || 'No additional details provided.';

  const newIssue: Issue = {
    id: 'i' + Date.now(),
    title: issueTitle,
    cat,
    votes: 0,
    status: 'open',
    ll: [ll[0], ll[1]],
    by: reporter,
    mine: true,
    ago: 'Just now',
    desc: issueDesc,
    notified: notified || null,
    fit: fit || null,
    orgs: [],
    updates: [
      {
        who: reporter,
        text: notified ? `Reported the issue and notified ${notified}.` : 'Reported the issue.',
        when: 'Just now'
      }
    ],
    tasks: [],
    thread: []
  };

  db.createIssue(newIssue);
  // register initial upvote
  db.toggleUpvote(newIssue.id);

  broadcastIssueCreated(newIssue);
  res.status(201).json({ issue: newIssue });
});

// POST toggle upvote
router.post('/:id/upvote', (req: Request, res: Response) => {
  const result = db.toggleUpvote(req.params.id);
  if (!result) return res.status(404).json({ error: 'Issue not found' });

  broadcastUpvote(req.params.id, result.votes);
  res.json(result);
});

// POST organization volunteers on issue
router.post('/:id/volunteer', (req: Request, res: Response) => {
  const { orgName, plan, when, createEvent } = req.body;
  const O = orgName || 'Green Elm';
  const planText = (plan || '').trim() || 'Our team will assess and coordinate repairs.';
  const issue = db.getIssue(req.params.id);

  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  let eventId: string | undefined;

  if (createEvent) {
    eventId = 'e' + Date.now();
    const newEvent: NeighborhoodEvent = {
      id: eventId,
      title: `Fix-it day: ${issue.title}`,
      org: O,
      cat: 'Volunteer',
      day: 21,
      time: '9 – 11 am',
      place: 'Meet at the pin',
      going: 1,
      ll: [issue.ll[0] + 0.0002, issue.ll[1] + 0.0002],
      issue: issue.id,
      desc: planText
    };
    db.createEvent(newEvent);
    broadcastEventCreated(newEvent);
  }

  const updated = db.updateIssue(issue.id, cur => {
    cur.orgs = [
      ...cur.orgs,
      {
        name: O,
        role: planText.length > 40 ? 'Volunteer crew' : planText,
        lead: cur.orgs.length === 0
      }
    ];
    cur.status = 'progress';
    cur.updates.unshift({
      who: O,
      text: `Volunteered: ${planText} (${(when || 'this weekend').toLowerCase()})`,
      when: 'Just now'
    });
    cur.tasks.push(
      { id: 't_' + Date.now(), t: 'Share plan with neighbors', who: O, done: true },
      { id: 't_' + (Date.now() + 1), t: 'Visit the site for assessment', who: O, done: false }
    );
    if (eventId) cur.event = eventId;
    return cur;
  });

  if (updated) broadcastIssueUpdated(updated);
  res.json({ issue: updated, eventId });
});

// POST post public update for neighbors
router.post('/:id/updates', (req: Request, res: Response) => {
  const { who, text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Update text is required' });

  const updated = db.updateIssue(req.params.id, cur => {
    cur.updates.unshift({
      who: who || 'Green Elm',
      text: text.trim(),
      when: 'Just now'
    });
    return cur;
  });

  if (!updated) return res.status(404).json({ error: 'Issue not found' });
  broadcastIssueUpdated(updated);
  res.json({ issue: updated });
});

// PATCH change issue status (fixed / reopen)
router.patch('/:id/status', (req: Request, res: Response) => {
  const { status, who } = req.body;
  if (!status || !['open', 'progress', 'fixed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updated = db.updateIssue(req.params.id, cur => {
    cur.status = status;
    if (status === 'fixed') {
      cur.updates.unshift({
        who: who || 'Green Elm',
        text: 'Marked as fixed. Thanks everyone for pitching in!',
        when: 'Just now'
      });
    }
    return cur;
  });

  if (!updated) return res.status(404).json({ error: 'Issue not found' });
  broadcastIssueUpdated(updated);
  res.json({ issue: updated });
});

// POST add collaborative task
router.post('/:id/tasks', (req: Request, res: Response) => {
  const { t, who } = req.body;
  if (!t || !t.trim()) return res.status(400).json({ error: 'Task title is required' });

  const updated = db.updateIssue(req.params.id, cur => {
    cur.tasks.push({
      id: 't_' + Date.now(),
      t: t.trim(),
      who: who || 'Green Elm',
      done: false
    });
    return cur;
  });

  if (!updated) return res.status(404).json({ error: 'Issue not found' });
  broadcastIssueUpdated(updated);
  res.json({ issue: updated });
});

// PATCH toggle task done state
router.patch('/:id/tasks/:taskIndex/toggle', (req: Request, res: Response) => {
  const taskIndex = parseInt(req.params.taskIndex, 10);

  const updated = db.updateIssue(req.params.id, cur => {
    if (cur.tasks[taskIndex]) {
      cur.tasks[taskIndex].done = !cur.tasks[taskIndex].done;
    }
    return cur;
  });

  if (!updated) return res.status(404).json({ error: 'Issue or task not found' });
  broadcastIssueUpdated(updated);
  res.json({ issue: updated });
});

// POST send message in private inter-org chat
router.post('/:id/messages', (req: Request, res: Response) => {
  const { who, text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Message text is required' });

  const updated = db.updateIssue(req.params.id, cur => {
    cur.thread.push({
      id: 'm_' + Date.now(),
      who: who || 'Green Elm',
      text: text.trim(),
      createdAt: new Date().toISOString()
    });
    return cur;
  });

  if (!updated) return res.status(404).json({ error: 'Issue not found' });
  broadcastIssueUpdated(updated);
  res.json({ issue: updated });
});

// POST invite another organization
router.post('/:id/invite', (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Organization name is required' });

  const updated = db.updateIssue(req.params.id, cur => {
    if (!cur.orgs.some(o => o.name === name)) {
      cur.orgs.push({
        name,
        role: 'Invited · pending'
      });
      cur.updates.unshift({
        who: 'Green Elm',
        text: `Invited ${name} to help coordinate.`,
        when: 'Just now'
      });
    }
    return cur;
  });

  if (!updated) return res.status(404).json({ error: 'Issue not found' });
  broadcastIssueUpdated(updated);
  res.json({ issue: updated });
});

export default router;
