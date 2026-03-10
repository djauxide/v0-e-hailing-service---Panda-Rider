import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError, ErrorCodes } from '../utils/errors';

type ValidationTarget = 'body' | 'query' | 'params';

export function validateRequest(
  schema: Joi.Schema,
  target: ValidationTarget = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[target];

    const { value, error } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(
        ApiError.badRequest(message, ErrorCodes.VALIDATION_ERROR, {
          errors: error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          })),
        })
      );
    }

    // Replace with validated and sanitized values
    req[target] = value;
    next();
  };
}

export const validateBody = (schema: Joi.Schema) => validateRequest(schema, 'body');
export const validateQuery = (schema: Joi.Schema) => validateRequest(schema, 'query');
export const validateParams = (schema: Joi.Schema) => validateRequest(schema, 'params');
