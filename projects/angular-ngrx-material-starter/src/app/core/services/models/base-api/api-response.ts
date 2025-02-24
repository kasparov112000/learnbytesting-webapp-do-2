import { ApiError } from './api-error';
import { ApiResponseMessage } from './api-response-message';

export class ApiResponse<TResponse> {
    public version: string;
    public statusCode: number;
    public message: ApiResponseMessage;
    public responseException: ApiError;
    public result: TResponse;

    constructor(result?: TResponse) {
        this.statusCode = 200;
        this.version = '1.0.0.0';
        this.message = ApiResponseMessage.success;
        this.result = result;
    }
}