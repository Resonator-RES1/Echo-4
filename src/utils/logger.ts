export const logger = {
  error: (message: string, error: Error, errorInfo?: any) => {
    // In a production environment, this would integrate with a logging service like Sentry.
    console.error(`[Cynical Mirror Error] ${message}`, error, errorInfo);
  },
  info: (message: string, data?: any) => {
    console.info(`[Cynical Mirror Info] ${message}`, data);
  }
};
