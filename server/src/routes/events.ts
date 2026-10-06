import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { broadcastRsvp } from '../socket.js';

const router = Router();

// GET all events
router.get('/', (_req: Request, res: Response) => {
  const events = db.getEvents();
  const rsvps = db.getRsvps();
  res.json({ events, rsvps });
});

// GET single event
router.get('/:id', (req: Request, res: Response) => {
  const event = db.getEvent(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const rsvps = db.getRsvps();
  res.json({ event, rsvp: rsvps[event.id] || null });
});

// POST submit / update RSVP
router.post('/:id/rsvp', (req: Request, res: Response) => {
  const { status, group, remind } = req.body;
  if (!status || !['going', 'maybe', 'cant'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (going, maybe, cant) is required' });
  }

  const groupCount = Math.max(1, Math.min(9, parseInt(group, 10) || 1));
  const remindMe = remind !== false;

  const record = db.setRsvp(req.params.id, status, groupCount, remindMe);
  broadcastRsvp(req.params.id, record);

  res.json({ rsvp: record });
});

// GET user RSVPs
router.get('/user/rsvps', (_req: Request, res: Response) => {
  res.json({ rsvps: db.getRsvps() });
});

export default router;
