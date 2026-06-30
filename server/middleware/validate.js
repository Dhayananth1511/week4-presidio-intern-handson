/**
 * Generic Validation Middleware
 * ---
 * This middleware takes a Zod schema and validates the request body against it.
 * If validation fails, it returns a 400 response with the specific errors.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    const errorMessages = result.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: errorMessages,
    });
  }
  
  // Replace req.body with the sanitized/transformed data from Zod
  req.body = result.data;
  next();
};

module.exports = validate;
