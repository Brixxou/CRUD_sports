const { z } = require('zod');

const upsertSessionSchema = z.object({
  sport: z.string().min(1).optional(),
  date: z.string().datetime().optional(),   // ISO string
  duree: z.coerce.number().int().positive().optional(),
  description: z.string().optional(),
  // Pour le contrôle de concurrence (voir Étape 4)
  updatedAt: z.string().datetime().optional()
});

module.exports = { upsertSessionSchema };