import { ApiValidationError } from './api-validation-error';

export class ApiError {
    public isError: boolean;
    public exceptionMessage?: string;
    public foo!: boolean;
    public details?: string;
    public validationErrors: ApiValidationError[] = new Array<ApiValidationError>();

    constructor(isError?: boolean, exceptionMessage?: string, details?: string) {
        this.isError = isError;
        this.exceptionMessage = exceptionMessage;
        this.details = details;
    }
}
