export class ApiValidationError {
    public field: string;
    public errorType: string;
    public message: string;

    constructor(init?: { field?: string, errorType?: string, message?: string }) {
        if (init) {
            Object.assign(this, init);
        }
    }
}