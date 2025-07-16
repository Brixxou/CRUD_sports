const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

// ➡️ GET all sessions
app.get('/api/sessions', async (req, res) => {
  const sessions = await prisma.session.findMany();
  res.json(sessions);
});

// ➡️ GET one session by id
app.get('/api/sessions/:id', async (req, res) => {
  const id = Number(req.params.id);
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) return res.status(404).json({ message: 'Not found' });
  res.json(session);
});

// ➡️ POST create session
app.post('/api/sessions', async (req, res) => {
  const { sport, date, duree, description } = req.body;
  try {
    const newSession = await prisma.session.create({
      data: { sport, date: new Date(date), duree: Number(duree), description },
    });
    res.status(201).json(newSession);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ➡️ PUT update session
app.put('/api/sessions/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { sport, date, duree, description } = req.body;
  try {
    const updated = await prisma.session.update({
      where: { id },
      data: { sport, date: new Date(date), duree: Number(duree), description },
    });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

// ➡️ DELETE session
app.delete('/api/sessions/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.session.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API CRUD_sports sur http://localhost:${PORT}`));
