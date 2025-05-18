import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

type SuccessResponse<T> = {
  status: 'success';
  data: T;
  message?: string;
};

type ErrorResponse = {
  status: 'error';
  message: string;
  code?: string;
  details?: unknown;
};

class ApiResponse {
  public static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation successful',
    statusCode: number = StatusCodes.OK
  ): Response<SuccessResponse<T>> {
    return res.status(statusCode).json({
      status: 'success',
      data,
      message,
    });
  }

  public static error(
    res: Response,
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    code?: string,
    details?: unknown
  ): Response<ErrorResponse> {
    const response: ErrorResponse = {
      status: 'error',
      message,
    };

    if (code) {
      response.code = code;
    }

    if (details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }

  public static notFound(res: Response, message: string = 'Resource not found'): Response<ErrorResponse> {
    return this.error(res, message, StatusCodes.NOT_FOUND, 'NOT_FOUND');
  }

  public static badRequest(
    res: Response,
    message: string = 'Bad request',
    details?: unknown
  ): Response<ErrorResponse> {
    return this.error(res, message, StatusCodes.BAD_REQUEST, 'BAD_REQUEST', details);
  }

  public static unauthorized(res: Response, message: string = 'Unauthorized'): Response<ErrorResponse> {
    return this.error(res, message, StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED');
  }

  public static forbidden(res: Response, message: string = 'Forbidden'): Response<ErrorResponse> {
    return this.error(res, message, StatusCodes.FORBIDDEN, 'FORBIDDEN');
  }

  public static conflict(res: Response, message: string = 'Conflict'): Response<ErrorResponse> {
    return this.error(res, message, StatusCodes.CONFLICT, 'CONFLICT');
  }
}

export { ApiResponse };
