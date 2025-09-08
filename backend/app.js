// backend/index.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { upsertSessionSchema } = require('./validation');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

// LIST (filtrable) — par défaut, on ne renvoie PAS les supprimées
// /api/sessions?includeDeleted=false&sport=Running&from=2025-07-01&to=2025-07-31
app.get('/api/sessions', async (req, res) => {
  const { includeDeleted, sport, from, to } = req.query;

  const where = {
    deletedAt: includeDeleted === 'true' ? undefined : null,
    ...(sport ? { sport } : {}),
    ...(from || to ? { 
      date: { 
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {})
      } 
    } : {})
  };

  const sessions = await prisma.session.findMany({
    where,
    orderBy: { date: 'desc' }
  });
  res.json(sessions);
});

// READ
app.get('/api/sessions/:id', async (req, res) => {
  const id = Number(req.params.id);
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session || session.deletedAt) return res.status(404).json({ message: 'Not found' });
  res.json(session);
});

// CREATE (existant chez toi, gardé pour contexte)
app.post('/api/sessions', async (req, res) => {
  const parse = upsertSessionSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });

  const { sport, date, duree, description } = parse.data;

  try {
    const newSession = await prisma.session.create({
      data: { sport, date: new Date(date), duree, description }
    });
    res.status(201).json(newSession);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// UPDATE (PATCH partiel, le plus intuitif pour le front)
app.patch('/api/sessions/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parse = upsertSessionSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues });

  const { sport, date, duree, description, updatedAt } = parse.data;

  // Contrôle de concurrence (voir Étape 4)
  const current = await prisma.session.findUnique({ where: { id } });
  if (!current || current.deletedAt) return res.status(404).json({ message: 'Not found' });

  if (updatedAt && new Date(updatedAt).getTime() !== current.updatedAt.getTime()) {
    return res.status(409).json({ 
      message: 'Conflit de version (la séance a été modifiée ailleurs). Recharge les données.'
    });
  }

  try {
    const updated = await prisma.session.update({
      where: { id },
      data: {
        ...(sport !== undefined ? { sport } : {}),
        ...(date !== undefined ? { date: new Date(date) } : {}),
        ...(duree !== undefined ? { duree } : {}),
        ...(description !== undefined ? { description } : {})
      }
    });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE (soft delete par défaut, + option hard)
app.delete('/api/sessions/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { hard } = req.query;

  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) return res.status(404).json({ message: 'Not found' });

  try {
    if (hard === 'true') {
      await prisma.session.delete({ where: { id } });
      return res.status(204).end();
    } else {
      const soft = await prisma.session.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return res.json(soft);
    }
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// RESTORE (annule le soft delete)
app.post('/api/sessions/:id/restore', async (req, res) => {
  const id = Number(req.params.id);
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session || !session.deletedAt) return res.status(404).json({ message: 'Not found or not deleted' });

  const restored = await prisma.session.update({
    where: { id },
    data: { deletedAt: null }
  });
  res.json(restored);
});

// BULK DELETE (soft) — pratique pour la sélection multiple côté UI
app.post('/api/sessions/bulk-delete', async (req, res) => {
  const { ids } = req.body; // ex: { "ids": [1,2,3] }
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'ids[] required' });

  const result = await prisma.session.updateMany({
    where: { id: { in: ids } },
    data: { deletedAt: new Date() }
  });
  res.json({ count: result.count });
});

const PORT = process.env.PORT || 3001;
// Basic root and health endpoints to make the service friendly when visited directly
app.get('/', (req, res) => {
  return res.send('API CRUD_sports: OK');
});

app.get('/health', (req, res) => {
  return res.json({ status: 'ok' });
});

app.listen(PORT, () => console.log(`API CRUD_sports sur http://localhost:${PORT}`));
