const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(100),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
});

module.exports = {
  createTaskSchema,
};
