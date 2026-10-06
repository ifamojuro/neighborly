import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { UserPersona } from '@neighborly/shared';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ persona: db.getPersona() });
});

router.post('/', (req: Request, res: Response) => {
  const { role } = req.body;
  let newPersona: UserPersona;

  if (role === 'org') {
    newPersona = {
      role: 'org',
      name: 'Green Elm',
      subtitle: 'Verified org · Elm Park',
      orgName: 'Green Elm'
    };
  } else {
    newPersona = {
      role: 'resident',
      name: 'Dana Rivera',
      subtitle: 'Elm Park · neighbor since 2024'
    };
  }

  const updated = db.setPersona(newPersona);
  res.json({ persona: updated });
});

export default router;
