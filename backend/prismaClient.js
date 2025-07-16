const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // CREATE
  const session = await prisma.session.create({
    data: {
      sport: "Natation",
      date: new Date("2025-07-17T09:00:00Z"),
      duree: 60,
      description: "Entraînement endurance",
    }
  });
  console.log("Créé :", session);

  // READ
  const sessions = await prisma.session.findMany();
  console.log("Toutes les séances :", sessions);

  // UPDATE
  const updated = await prisma.session.update({
    where: { id: session.id },
    data: { description: "Entraînement intensif" }
  });
  console.log("Modifié :", updated);

  // DELETE
  const deleted = await prisma.session.delete({
    where: { id: session.id }
  });
  console.log("Supprimé :", deleted);
}

main()
  .catch(e => console.error(e))
  .finally(async () => { await prisma.$disconnect(); });
