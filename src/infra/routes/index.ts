import { Application } from 'express';

export const setupRoutes = (app: Application): void => {
  app.use((_req, res) => {
    res.status(404).json({
      status: 'error',
      message: 'Not Found',
    });
  });
};
