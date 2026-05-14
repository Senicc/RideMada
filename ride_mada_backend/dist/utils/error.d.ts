export declare class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
export declare const catchAsync: (fn: Function) => (req: any, res: any, next: any) => void;
//# sourceMappingURL=error.d.ts.map