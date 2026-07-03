import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (
  schema: z.ZodTypeAny,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      if (source === 'query' || source === 'params') {
        const parsedObj = parsed as Record<string, unknown>;
        // Mutate existing object keys directly since req.query and req.params are read-only properties
        Object.keys(req[source]).forEach((key) => {
          if (!(key in parsedObj)) {
            delete req[source][key];
          }
        });
        Object.assign(req[source], parsedObj);
      } else {
        req[source] = parsed;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validate;
