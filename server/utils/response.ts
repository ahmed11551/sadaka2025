import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T = any>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 400
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    success: false,
    error,
  });
};

export const sendPaginated = <T = any>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): Response<ApiResponse<T[]>> => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};
