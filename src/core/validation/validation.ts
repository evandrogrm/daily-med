import { NextFunction, Request, Response } from 'express';
import Joi, { ValidationError as JoiValidationError } from 'joi';
import { BadRequestError } from '../errors/app-error';

type ValidationSchema = {
  body?: Joi.Schema;
  query?: Joi.Schema;
  params?: Joi.Schema;
  headers?: Joi.Schema;
};

const validate = (schema: ValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { body, query, params, headers } = schema;

      if (body) {
        const { error, value } = body.validate(req.body, { abortEarly: false });
        if (error) {
          throw error;
        }
        req.body = value;
      }

      if (query) {
        const { error, value } = query.validate(req.query, { abortEarly: false });
        if (error) {
          throw error;
        }
        req.query = value;
      }

      if (params) {
        const { error, value } = params.validate(req.params, { abortEarly: false });
        if (error) {
          throw error;
        }
        req.params = value;
      }

      if (headers) {
        const { error, value } = headers.validate(req.headers, { abortEarly: false });
        if (error) {
          throw error;
        }
        req.headers = value;
      }

      next();
    } catch (error) {
      if (error instanceof JoiValidationError) {
        const details = error.details.map((detail) => ({
          message: detail.message,
          path: detail.path,
          type: detail.type,
        }));

        return next(new BadRequestError('Validation failed', {
          details,
          context: {
            originalError: error,
          },
        }));
      }
      next(error);
    }
  };
};

export { Joi, validate };

