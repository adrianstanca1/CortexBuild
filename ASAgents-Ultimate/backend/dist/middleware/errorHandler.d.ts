import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number);
}
export declare function errorHandler(error: Error | AppError, req: Request, res: Response, next: NextFunction): void;
export declare function notFoundHandler(req: Request, res: Response): void;
export declare function asyncHandler(fn: Function): (req: Request, res: Response, next: NextFunction) => void;
export declare const errors: {
    notFound: (resource?: string) => AppError;
    unauthorized: (message?: string) => AppError;
    forbidden: (message?: string) => AppError;
    badRequest: (message?: string) => AppError;
    conflict: (message?: string) => AppError;
    unprocessable: (message?: string) => AppError;
    internal: (message?: string) => AppError;
};
//# sourceMappingURL=errorHandler.d.ts.map