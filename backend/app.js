const prisma = require('./prismaClient');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
// backend/index.js (exemple)

app.use(express.json());

// CRUD Sessions avec Prisma

// Get all
app.get('/api/sessions', async (req, res) => {
  const sessions = await prisma.session.findMany();
  res.json(sessions);
});

// Get by ID
app.get('/api/sessions/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) return res.status(404).json({ message: 'Not found' });
  res.json(session);
});

// Create
app.post('/api/sessions', async (req, res) => {
  const { sport, date, duree, description } = req.body;
  const newSession = await prisma.session.create({
    data: { sport, date: new Date(date), duree: Number(duree), description },
  });
  res.status(201).json(newSession);
});

// Update
app.put('/api/sessions/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { sport, date, duree, description } = req.body;
  const updated = await prisma.session.update({
    where: { id },
    data: { sport, date: new Date(date), duree: Number(duree), description },
  });
  res.json(updated);
});

// Delete
app.delete('/api/sessions/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.session.delete({ where: { id } });
  res.status(204).end();
});

app.listen(3000, () => console.log('API sur http://localhost:3000'));