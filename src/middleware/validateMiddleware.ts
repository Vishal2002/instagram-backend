import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import httpStatus from 'http-status';

export function validateRequest(schema: z.AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(httpStatus.BAD_REQUEST).json({ errors: error.issues });
      } else {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
      }
    }
  };
}